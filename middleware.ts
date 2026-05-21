import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ['/account', '/checkout']

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Protect routes that require authentication — full JWT verification
  // happens server-side in layouts/actions. Here we just check presence.
  const isProtected = PROTECTED_PATHS.some((p) => pathname.includes(p))
  if (isProtected) {
    const hasSession =
      req.cookies.has('__Secure-authjs.session-token') ||
      req.cookies.has('authjs.session-token')
    if (!hasSession) {
      const loginUrl = new URL(
        `/${req.nextUrl.locale ?? 'es'}/login`,
        req.url,
      )
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
