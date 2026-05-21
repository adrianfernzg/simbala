import NextAuth from 'next-auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { authConfig } from '@/lib/auth.config'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: unknown }) => {
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
