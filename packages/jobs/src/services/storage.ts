import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;
const PUBLIC_URL = process.env.S3_PUBLIC_URL!;

export class StorageService {
  /**
   * Upload a file to S3-compatible storage
   */
  static async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${PUBLIC_URL}/${key}`;
  }

  /**
   * Upload audio file
   */
  static async uploadAudio(
    clipId: string,
    buffer: Buffer,
    extension: string = 'mp3'
  ): Promise<string> {
    const key = `clips/${clipId}/audio.${extension}`;
    return this.uploadFile(key, buffer, `audio/${extension}`);
  }

  /**
   * Upload waveform JSON
   */
  static async uploadWaveform(clipId: string, waveformData: any): Promise<string> {
    const key = `clips/${clipId}/waveform.json`;
    return this.uploadFile(key, JSON.stringify(waveformData), 'application/json');
  }

  /**
   * Upload thumbnail image
   */
  static async uploadThumbnail(
    clipId: string,
    buffer: Buffer,
    extension: string = 'jpg'
  ): Promise<string> {
    const key = `clips/${clipId}/thumbnail.${extension}`;
    return this.uploadFile(key, buffer, `image/${extension}`);
  }

  /**
   * Upload transcript words JSON
   */
  static async uploadTranscriptWords(clipId: string, words: any): Promise<string> {
    const key = `clips/${clipId}/transcript-words.json`;
    return this.uploadFile(key, JSON.stringify(words), 'application/json');
  }

  /**
   * Get a signed URL for temporary access
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate upload URL for client-side uploads
   */
  static async getUploadUrl(
    clipId: string,
    fileType: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    const extension = fileType.split('/')[1];
    const key = `uploads/${clipId}/original.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return { uploadUrl, key };
  }
}
