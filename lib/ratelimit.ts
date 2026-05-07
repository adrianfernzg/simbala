import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (_ratelimit) return _ratelimit

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Fallback en desarrollo sin Redis — permite todas las peticiones
    return {
      limit: async () => ({ success: true, limit: 10, remaining: 9, reset: 0, pending: Promise.resolve() }),
    } as unknown as Ratelimit
  }

  _ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  })
  return _ratelimit
}

export const ratelimit = new Proxy({} as Ratelimit, {
  get(_target, prop) {
    return (getRatelimit() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
