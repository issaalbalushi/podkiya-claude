import ffmpeg from 'fluent-ffmpeg';
import { WaveformData } from '@podkiya/core';
import { Readable } from 'stream';

export class AudioService {
  /**
   * Transcode audio to normalized MP3
   */
  static async transcodeToMp3(
    inputBuffer: Buffer,
    targetBitrate: number = 96
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(inputBuffer);

      ffmpeg(inputStream)
        .audioCodec('libmp3lame')
        .audioBitrate(targetBitrate)
        .audioFrequency(44100)
        .audioChannels(2)
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg transcode error:', err);
          reject(new Error('Failed to transcode audio'));
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Get audio duration
   */
  static async getDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(buffer);

      ffmpeg.ffprobe(inputStream, (err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err);
          reject(new Error('Failed to get audio duration'));
          return;
        }

        const duration = metadata.format.duration || 0;
        resolve(duration);
      });
    });
  }

  /**
   * Generate waveform data from audio
   * This is a simplified version - in production, use a library like audiowaveform
   */
  static async generateWaveform(
    buffer: Buffer,
    samples: number = 100
  ): Promise<WaveformData> {
    try {
      const duration = await this.getDuration(buffer);

      // For now, generate mock waveform data
      // In production, use a proper audio analysis library
      const waveformSamples: number[] = [];
      for (let i = 0; i < samples; i++) {
        // Generate pseudo-random waveform with some variation
        const base = 0.3 + Math.random() * 0.4;
        const variation = Math.sin((i / samples) * Math.PI * 4) * 0.2;
        waveformSamples.push(Math.min(1, Math.max(0, base + variation)));
      }

      return {
        samples: waveformSamples,
        duration,
        sampleRate: 44100,
      };
    } catch (error) {
      console.error('Waveform generation error:', error);
      throw new Error('Failed to generate waveform');
    }
  }

  /**
   * Validate audio file
   */
  static async validateAudio(buffer: Buffer): Promise<{
    valid: boolean;
    duration?: number;
    error?: string;
  }> {
    try {
      const duration = await this.getDuration(buffer);

      if (duration === 0) {
        return { valid: false, error: 'Audio file is empty or corrupted' };
      }

      if (duration > 180) {
        return { valid: false, duration, error: 'Audio exceeds 3 minute limit' };
      }

      return { valid: true, duration };
    } catch (error) {
      return { valid: false, error: 'Invalid audio file format' };
    }
  }

  /**
   * Extract audio metadata
   */
  static async getMetadata(buffer: Buffer): Promise<{
    duration: number;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    format?: string;
  }> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(buffer);

      ffmpeg.ffprobe(inputStream, (err, metadata) => {
        if (err) {
          console.error('FFprobe metadata error:', err);
          reject(new Error('Failed to get audio metadata'));
          return;
        }

        const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration || 0,
          bitrate: metadata.format.bit_rate,
          sampleRate: audioStream?.sample_rate,
          channels: audioStream?.channels,
          format: metadata.format.format_name,
        });
      });
    });
  }
}
