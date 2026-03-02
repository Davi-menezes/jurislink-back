import { redis } from './redis'

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - window * 1000

    // Remove requisições antigas
    await redis.zremrangebyscore(key, 0, windowStart)

    // Contar requisições na janela atual
    const count = await redis.zcard(key)

    if (count >= limit) {
      const oldestRequest = await redis.zrange(key, 0, 0, { withScores: true })
      const reset = oldestRequest[0] 
        ? Math.ceil((Number(oldestRequest[1]) + window * 1000 - now) / 1000)
        : window

      return {
        success: false,
        remaining: 0,
        reset,
      }
    }

    // Adicionar nova requisição
    await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` })
    await redis.expire(key, window)

    return {
      success: true,
      remaining: limit - count - 1,
      reset: window,
    }
  } catch (error) {
    // Se o Redis falhar, permitir a requisição (fail open)
    console.error('Rate limit error:', error)
    return {
      success: true,
      remaining: limit,
      reset: window,
    }
  }
}

// Rate limiters específicos
export async function rateLimitByIP(ip: string, limit = 100, window = 60) {
  return rateLimit(`ip:${ip}`, limit, window)
}

export async function rateLimitByUser(userId: string, limit = 50, window = 60) {
  return rateLimit(`user:${userId}`, limit, window)
}

export async function rateLimitByAction(
  userId: string, 
  action: string, 
  limit = 5, 
  window = 60
) {
  return rateLimit(`action:${userId}:${action}`, limit, window)
}

// Login attempts
export async function rateLimitLogin(identifier: string) {
  return rateLimit(`login:${identifier}`, 5, 300) // 5 tentativas em 5 minutos
}

// API endpoints específicos
export async function rateLimitAPI(endpoint: string, ip: string) {
  return rateLimit(`api:${endpoint}:${ip}`, 20, 60)
}
