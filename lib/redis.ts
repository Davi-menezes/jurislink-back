import { Redis } from '@upstash/redis'

let redisClient: Redis | null | undefined

export function getRedis() {
  if (redisClient !== undefined) return redisClient

  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    redisClient = null
    return redisClient
  }

  redisClient = new Redis({ url, token })
  return redisClient
}

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    if (!redis) return null
    return await redis.get<T>(key)
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {
    // Fail silently - cache is optional
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Fail silently
  }
}
