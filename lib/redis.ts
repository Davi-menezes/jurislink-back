import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key)
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {
    // Fail silently - cache is optional
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Fail silently
  }
}
