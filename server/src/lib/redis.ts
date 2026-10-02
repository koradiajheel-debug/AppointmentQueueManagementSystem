import Redis, { Redis as RedisClient } from 'ioredis';
import { EventEmitter } from 'events';
import { env } from '../config/env';
import { logger } from './logger';

// In-Memory Fallback Simulator for local development or when REDIS_URL is missing
class InMemoryRedis extends EventEmitter {
  private store = new Map<string, string>();
  private expiries = new Map<string, NodeJS.Timeout>();

  public async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  public async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      if (this.expiries.has(key)) clearTimeout(this.expiries.get(key)!);
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.expiries.delete(key);
      }, duration * 1000);
      this.expiries.set(key, timer);
    }
    return 'OK';
  }

  public async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    if (this.expiries.has(key)) {
      clearTimeout(this.expiries.get(key)!);
      this.expiries.delete(key);
    }
    return existed ? 1 : 0;
  }

  public async ping(): Promise<string> {
    return 'PONG';
  }

  public async publish(channel: string, message: string): Promise<number> {
    this.emit('message', channel, message);
    return 1;
  }

  public async subscribe(channel: string): Promise<number> {
    return 1;
  }

  public async quit(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  public status = 'ready';
  public isReady(): boolean {
    return this.status === 'ready';
  }
}

export const isRedisReady = (): boolean => {
  if (!redisClient) return false;
  if ('isReady' in redisClient && typeof (redisClient as any).isReady === 'function') {
    return (redisClient as any).isReady();
  }
  return (redisClient as any).status === 'ready';
};

let redisClient: RedisClient | InMemoryRedis;
let isInMemoryFallback = false;

if (env.REDIS_URL && env.REDIS_URL.trim() !== '') {
  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) {
          logger.warn('⚠️ [Redis] Exceeded retry attempts. Switching to in-memory fallback.');
          return null; // Stop retrying and trigger fallback
        }
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.warn({ err }, 'Redis connection error, reconnecting...');
        return true;
      },
    });

    client.on('connect', () => {
      logger.info('✅ [Redis] Connected successfully to Upstash/Redis.');
    });

    client.on('error', (err) => {
      logger.warn({ err }, 'Redis error detected.');
    });

    redisClient = client;
  } catch (err) {
    logger.warn('Failed to initialize Redis client. Falling back to in-memory cache.');
    redisClient = new InMemoryRedis();
    isInMemoryFallback = true;
  }
} else {
  logger.info('ℹ️ [Redis] REDIS_URL not configured. Using high-performance in-memory cache fallback.');
  redisClient = new InMemoryRedis();
  isInMemoryFallback = true;
}

export const redis = redisClient;
export { redisClient };
export const isUsingMemoryRedis = () => isInMemoryFallback;

export const connectRedis = async (): Promise<void> => {
  if (!isInMemoryFallback && redisClient && 'ping' in redisClient) {
    try {
      await (redisClient as any).ping();
      logger.info('Redis ping successful');
    } catch (err) {
      logger.warn({ err }, 'Redis ping failed; falling back to in-memory mode');
    }
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && 'quit' in redisClient) {
    await (redisClient as any).quit();
  }
};

