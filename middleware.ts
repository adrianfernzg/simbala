import NextAuth from 'next-auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { authConfig } from '@/lib/auth.config'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: unknown }) => {
  const res = intlMiddleware(req)

  // next-intl builds rewrite URLs using `new URL(path, req.url)` which
  // produces an absolute URL (https://simbala-production.up.railway.app/es).
  // Railway terminates TLS and forwards HTTP to the container, so the
  // server's internal origin (http://localhost:3000) does not match the
  // public URL. Next.js treats it as a different origin and proxies the
  // request externally, creating an infinite loop. Stripping the origin
  // makes the rewrite relative so Next.js routes it internally.
  const rewriteUrl = res.headers.get('x-middleware-rewrite')
  if (rewriteUrl?.startsWith('http')) {
    try {
      const u = new URL(rewriteUrl)
      res.headers.set('x-middleware-rewrite', u.pathname + u.search)
    } catch {
      // malformed URL — leave as-is
    }
  }

  return res
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
