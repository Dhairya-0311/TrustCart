import Redis from 'ioredis';
import { env } from './env';

// Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  try {
    await client.ping();
    console.log('✅ Redis ping successful');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Don't exit — Redis is optional for basic functionality
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('📦 Redis disconnected');
  }
}

// Helper to create a separate Redis connection for BullMQ (it needs its own)
export function createBullMQConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
