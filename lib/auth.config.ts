import type { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Config Edge-compatible (sin bcryptjs, solo para middleware)
export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
