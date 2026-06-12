import { Redis } from '@upstash/redis'

function makeRedis(): Redis | null {
  if (process.env.NODE_ENV !== 'production') return null
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

const redis = makeRedis()

function windowToSeconds(window: string): number {
  const [num, unit] = window.split(' ')
  const n = parseInt(num, 10)
  if (unit === 's') return n
  if (unit === 'm') return n * 60
  if (unit === 'h') return n * 3600
  return n
}

// Simple INCR + EXPIRE rate limiter — no Lua scripts, works on all Redis plans
async function checkLimit(
  key: string,
  maxRequests: number,
  window: string,
): Promise<{ success: boolean }> {
  if (!redis) return { success: true }
  try {
    const seconds = windowToSeconds(window)
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, seconds)
    }
    return { success: count <= maxRequests }
  } catch {
    return { success: true } // fail open: si Redis falla, no bloqueamos
  }
}

// General: registro, contacto, login status (10 req / 10s)
export const ratelimit = {
  limit: (key: string) => checkLimit(key, 10, '10 s'),
}

// Envío de emails: verificación, reset de contraseña (3 req / 1h)
export const emailRatelimit = {
  limit: (key: string) => checkLimit(key, 3, '1 h'),
}

// Verificación de códigos: brute force sobre 6 dígitos (5 intentos / 15 min)
export const codeRatelimit = {
  limit: (key: string) => checkLimit(key, 5, '15 m'),
}

// Checkout: sesiones Stripe (5 req / 5 min)
export const checkoutRatelimit = {
  limit: (key: string) => checkLimit(key, 5, '5 m'),
}
