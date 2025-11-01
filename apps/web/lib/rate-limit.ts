import { redis } from './cache';
import { RATE_LIMITS } from '@podkiya/core';

export type RateLimitType = keyof typeof RATE_LIMITS;

export class RateLimiter {
  static async check(
    identifier: string,
    type: RateLimitType
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;

    const now = Date.now();
    const windowStart = now - config.WINDOW_MS;

    // Use Redis sorted set for sliding window
    await redis.zremrangebyscore(key, 0, windowStart);

    const count = await redis.zcard(key);

    if (count >= config.MAX_PER_DAY || count >= config.MAX_PER_MINUTE || count >= config.MAX_PER_HOUR || count >= config.MAX_PER_15_MIN) {
      const resetAt = new Date(now + config.WINDOW_MS);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(config.WINDOW_MS / 1000));

    const remaining = (config.MAX_PER_DAY || config.MAX_PER_MINUTE || config.MAX_PER_HOUR || config.MAX_PER_15_MIN || 100) - (count + 1);
    const resetAt = new Date(now + config.WINDOW_MS);

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  static async checkUpload(userId: string): Promise<boolean> {
    const result = await this.check(userId, 'UPLOAD');
    return result.allowed;
  }

  static async checkLike(userId: string): Promise<boolean> {
    const result = await this.check(userId, 'LIKE');
    return result.allowed;
  }

  static async checkFollow(userId: string): Promise<boolean> {
    const result = await this.check(userId, 'FOLLOW');
    return result.allowed;
  }

  static async checkReport(userId: string): Promise<boolean> {
    const result = await this.check(userId, 'REPORT');
    return result.allowed;
  }
}
