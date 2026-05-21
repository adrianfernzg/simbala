import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config (sin bcryptjs, sin OAuth providers — solo para middleware)
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected =
        nextUrl.pathname.includes('/account') || nextUrl.pathname.includes('/checkout')
      if (isProtected) return isLoggedIn
      return true
    },
  },
}
