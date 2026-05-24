import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ['/account', '/checkout']

export default function middleware(req: NextRequest) {
  // Server Actions POST to the page URL with the Next-Action header.
  // Passing them through intlMiddleware breaks the action response,
  // causing a network-level failure on the client. Skip all logic here —
  // auth is verified server-side inside the action.
  if (req.headers.has('next-action')) {
    return NextResponse.next()
  }

  const pathname = req.nextUrl.pathname

  const isProtected = PROTECTED_PATHS.some((p) => pathname.includes(p))
  if (isProtected) {
    const hasSession =
      req.cookies.has('__Secure-authjs.session-token') ||
      req.cookies.has('authjs.session-token')
    if (!hasSession) {
      // Extract locale from path (/es/... or /en/...) — req.nextUrl.locale
      // is always undefined in App Router (it was a Pages Router concept).
      const localeMatch = pathname.match(/^\/(es|en)\//)
      const locale = localeMatch?.[1] ?? 'es'
      const loginUrl = new URL(`/${locale}/login`, req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
