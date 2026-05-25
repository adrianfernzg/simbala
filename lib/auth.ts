import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations/auth'
import { getPayload } from 'payload'
import config from '@payload-config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, password: true, role: true, emailVerified: true },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
        if (!passwordMatch) return null

        if (!user.emailVerified) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        // Asegurar que emailVerified esté seteado (el adapter no lo actualiza al vincular)
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        }).catch(() => {})

        // Sincronizar con Payload Clientes
        try {
          const payload = await getPayload({ config })
          const existing = await payload.find({
            collection: 'clientes',
            where: { email: { equals: user.email } },
            limit: 1,
            overrideAccess: true,
          })
          if (existing.totalDocs === 0) {
            await payload.create({
              collection: 'clientes',
              overrideAccess: true,
              data: {
                email: user.email,
                name: user.name ?? '',
                prismaUserId: user.id,
                provider: 'google',
              },
            })
          }
        } catch {
          // No bloquear el login si falla el sync
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
})
