import Redis from 'ioredis';
import { CACHE_TTL } from '@podkiya/core';

const redis = new Redis(process.env.REDIS_URL!);

export class Cache {
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  }

  static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Specific cache helpers
  static async getFeed(language: string, page: number): Promise<any | null> {
    return this.get(`feed:${language}:${page}`);
  }

  static async setFeed(language: string, page: number, data: any): Promise<void> {
    await this.set(`feed:${language}:${page}`, data, CACHE_TTL.FEED_ANONYMOUS);
  }

  static async invalidateFeed(language?: string): Promise<void> {
    const pattern = language ? `feed:${language}:*` : 'feed:*';
    await this.invalidatePattern(pattern);
  }
}

export { redis };
