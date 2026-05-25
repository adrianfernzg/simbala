'use server'

import { db } from '@/lib/db'

type LoginStatus = 'not_found' | 'not_verified' | 'google_only' | 'wrong_password'

export async function checkLoginStatus(email: string): Promise<LoginStatus> {
  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true, password: true, accounts: { select: { provider: true } } },
  })

  if (!user) return 'not_found'

  const hasGoogle = user.accounts.some((a) => a.provider === 'google')

  if (!user.password && hasGoogle) return 'google_only'
  if (!user.emailVerified) return 'not_verified'
  return 'wrong_password'
}
