import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRedis(): Redis | null {
  if (process.env.NODE_ENV !== 'production') return null
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`

function makeLimiter(requests: number, window: Window): Ratelimit {
  const redis = makeRedis()
  if (!redis) {
    return {
      limit: async () => ({
        success: true,
        limit: requests,
        remaining: requests - 1,
        reset: 0,
        pending: Promise.resolve(),
      }),
    } as unknown as Ratelimit
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(requests, window),
    analytics: true,
  })
}

// General: registro, contacto, login status (10 req / 10s)
export const ratelimit = makeLimiter(10, '10 s')

// Envío de emails: verificación, reset de contraseña (3 req / 1h)
// Previene bombardeo de inbox
export const emailRatelimit = makeLimiter(3, '1 h')

// Verificación de códigos: brute force sobre 6 dígitos (5 intentos / 15 min)
export const codeRatelimit = makeLimiter(5, '15 m')

// Checkout: sesiones Stripe (5 req / 5 min)
export const checkoutRatelimit = makeLimiter(5, '5 m')
