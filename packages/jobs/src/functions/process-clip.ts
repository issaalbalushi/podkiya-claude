import { inngest } from '../client';
import { db } from '@podkiya/db';
import { AudioService } from '../services/audio';
import { TranscriptionService } from '../services/transcription';
import { SearchService } from '../services/search';
import { StorageService } from '../services/storage';

/**
 * Main workflow: Process uploaded clip
 * Steps: transcode -> transcribe -> index
 */
export const processClip = inngest.createFunction(
  {
    id: 'process-clip',
    name: 'Process Uploaded Clip',
    retries: 3,
  },
  { event: 'clip/uploaded' },
  async ({ event, step }) => {
    const { clipId, audioBuffer } = event.data;

    // Step 1: Transcode audio
    const { audioUrl, waveformUrl, duration } = await step.run(
      'transcode-audio',
      async () => {
        try {
          // Validate audio
          const validation = await AudioService.validateAudio(
            Buffer.from(audioBuffer, 'base64')
          );
          if (!validation.valid) {
            throw new Error(validation.error);
          }

          // Transcode to normalized MP3
          const transcodedBuffer = await AudioService.transcodeToMp3(
            Buffer.from(audioBuffer, 'base64')
          );

          // Generate waveform
          const waveformData = await AudioService.generateWaveform(transcodedBuffer);

          // Upload both to storage
          const audioUrl = await StorageService.uploadAudio(clipId, transcodedBuffer);
          const waveformUrl = await StorageService.uploadWaveform(
            clipId,
            waveformData
          );

          // Update clip in database
          await db.clip.update({
            where: { id: clipId },
            data: {
              audioUrl,
              waveformJsonUrl: waveformUrl,
              durationSec: validation.duration,
              status: 'in_review',
            },
          });

          // Create review task
          await db.reviewTask.create({
            data: {
              clipId,
              status: 'open',
            },
          });

          return {
            audioUrl,
            waveformUrl,
            duration: validation.duration!,
          };
        } catch (error) {
          console.error('Transcode error:', error);
          await db.clip.update({
            where: { id: clipId },
            data: { status: 'rejected', rejectionReason: 'Failed to process audio' },
          });
          throw error;
        }
      }
    );

    // Step 2: Transcribe audio
    const { transcriptText, wordsUrl } = await step.run(
      'transcribe-audio',
      async () => {
        try {
          const clip = await db.clip.findUnique({
            where: { id: clipId },
          });

          if (!clip || !clip.audioUrl) {
            throw new Error('Clip not found or audio URL missing');
          }

          // Download audio from storage for transcription
          // In production, you might want to use a temporary URL or stream
          const audioBuffer = Buffer.from(audioBuffer, 'base64');

          // Transcribe using Whisper
          const { text, words } = await TranscriptionService.transcribe(
            audioBuffer,
            clip.language
          );

          // Upload words JSON to storage
          const wordsUrl = await StorageService.uploadTranscriptWords(clipId, words);

          // Save transcript to database
          await db.transcript.create({
            data: {
              clipId,
              text,
              language: clip.language,
              wordsJsonUrl: wordsUrl,
            },
          });

          return {
            transcriptText: text,
            wordsUrl,
          };
        } catch (error) {
          console.error('Transcription error:', error);
          // Don't fail the whole pipeline if transcription fails
          // Just log and continue without transcript
          return { transcriptText: '', wordsUrl: '' };
        }
      }
    );

    // Step 3: Index for search
    await step.run('index-clip', async () => {
      try {
        const clip = await db.clip.findUnique({
          where: { id: clipId },
          include: {
            creator: true,
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: {
                likes: true,
                playEvents: true,
              },
            },
          },
        });

        if (!clip) {
          throw new Error('Clip not found');
        }

        // Calculate completion rate
        const completedPlays = await db.playEvent.count({
          where: { clipId, completed: true },
        });
        const completionRate =
          clip._count.playEvents > 0
            ? Math.round((completedPlays / clip._count.playEvents) * 100)
            : 0;

        // Create search index entry
        await SearchService.indexClip({
          objectID: clipId,
          clipId,
          title: clip.title,
          description: clip.description,
          language: clip.language,
          tags: clip.tags.map((ct) => ct.tag.label_en),
          tagSlugs: clip.tags.map((ct) => ct.tag.slug),
          creatorId: clip.creatorId,
          creatorName: clip.creator.name || 'Unknown',
          transcriptSnippet: transcriptText
            ? TranscriptionService.generateSnippet(transcriptText)
            : null,
          durationSec: clip.durationSec,
          thumbnailUrl: clip.thumbUrl,
          audioUrl: clip.audioUrl,
          publishedAt: clip.publishedAt?.getTime() || Date.now(),
          likeCount: clip._count.likes,
          playCount: clip._count.playEvents,
          completionRate,
        });
      } catch (error) {
        console.error('Indexing error:', error);
        // Don't fail if indexing fails, clip can still be used
      }
    });

    return {
      clipId,
      status: 'completed',
      audioUrl,
      waveformUrl,
      duration,
      transcriptText,
    };
  }
);

/**
 * Retry failed clip processing
 */
export const retryClipProcessing = inngest.createFunction(
  {
    id: 'retry-clip-processing',
    name: 'Retry Clip Processing',
  },
  { event: 'clip/retry' },
  async ({ event }) => {
    const { clipId } = event.data;

    // Fetch clip and trigger reprocessing
    const clip = await db.clip.findUnique({
      where: { id: clipId },
    });

    if (!clip) {
      throw new Error('Clip not found');
    }

    // Reset status
    await db.clip.update({
      where: { id: clipId },
      data: { status: 'draft' },
    });

    // Trigger processing again
    // Note: In real implementation, you'd need to have the audio buffer stored
    // This is a simplified version
    await inngest.send({
      name: 'clip/uploaded',
      data: {
        clipId,
        audioBuffer: '', // Should fetch from storage
      },
    });

    return { clipId, status: 'retrying' };
  }
);

/**
 * Update search index for a clip (when metadata changes)
 */
export const updateClipIndex = inngest.createFunction(
  {
    id: 'update-clip-index',
    name: 'Update Clip Search Index',
  },
  { event: 'clip/updated' },
  async ({ event }) => {
    const { clipId } = event.data;

    const clip = await db.clip.findUnique({
      where: { id: clipId },
      include: {
        creator: true,
        tags: {
          include: {
            tag: true,
          },
        },
        transcript: true,
        _count: {
          select: {
            likes: true,
            playEvents: true,
          },
        },
      },
    });

    if (!clip || clip.status !== 'approved') {
      // Remove from index if not approved
      if (clip) {
        await SearchService.removeClip(clipId);
      }
      return;
    }

    // Calculate completion rate
    const completedPlays = await db.playEvent.count({
      where: { clipId, completed: true },
    });
    const completionRate =
      clip._count.playEvents > 0
        ? Math.round((completedPlays / clip._count.playEvents) * 100)
        : 0;

    // Update search index
    await SearchService.updateClip(clipId, {
      title: clip.title,
      description: clip.description,
      tags: clip.tags.map((ct) => ct.tag.label_en),
      tagSlugs: clip.tags.map((ct) => ct.tag.slug),
      transcriptSnippet: clip.transcript
        ? TranscriptionService.generateSnippet(clip.transcript.text)
        : null,
      likeCount: clip._count.likes,
      playCount: clip._count.playEvents,
      completionRate,
    });

    return { clipId, status: 'updated' };
  }
);

/**
 * Remove clip from search index
 */
export const removeClipFromIndex = inngest.createFunction(
  {
    id: 'remove-clip-from-index',
    name: 'Remove Clip from Search Index',
  },
  { event: 'clip/removed' },
  async ({ event }) => {
    const { clipId } = event.data;
    await SearchService.removeClip(clipId);
    return { clipId, status: 'removed' };
  }
);
