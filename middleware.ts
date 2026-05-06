import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const isProtected =
    pathname.includes('/account') || pathname.includes('/checkout')

  if (isProtected) {
    const session = await auth()
    if (!session) {
      const locale = pathname.split('/')[1] || 'es'
      return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
