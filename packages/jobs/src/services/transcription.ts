import OpenAI from 'openai';
import { TranscriptWord } from '@podkiya/core';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class TranscriptionService {
  /**
   * Transcribe audio using OpenAI Whisper
   */
  static async transcribe(
    audioBuffer: Buffer,
    language?: string
  ): Promise<{ text: string; words: TranscriptWord[] }> {
    try {
      // Create a File-like object from buffer
      const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

      // Call Whisper API with word-level timestamps
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: language || undefined,
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
      });

      // Extract text
      const text = response.text || '';

      // Extract word-level timestamps
      const words: TranscriptWord[] = [];
      if ('words' in response && Array.isArray(response.words)) {
        for (const word of response.words) {
          words.push({
            word: word.word || '',
            start: word.start || 0,
            end: word.end || 0,
            confidence: 1.0, // Whisper doesn't provide confidence, default to 1.0
          });
        }
      }

      return { text, words };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Generate a snippet from transcript for search indexing
   */
  static generateSnippet(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Try to cut at sentence boundary
    const snippet = text.slice(0, maxLength);
    const lastPeriod = snippet.lastIndexOf('.');
    const lastExclamation = snippet.lastIndexOf('!');
    const lastQuestion = snippet.lastIndexOf('?');

    const lastSentence = Math.max(lastPeriod, lastExclamation, lastQuestion);

    if (lastSentence > maxLength * 0.7) {
      return snippet.slice(0, lastSentence + 1);
    }

    return snippet.trim() + '...';
  }
}
