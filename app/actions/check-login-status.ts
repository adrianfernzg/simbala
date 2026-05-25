'use server'

import { db } from '@/lib/db'

type LoginStatus = 'not_found' | 'not_verified' | 'wrong_password'

export async function checkLoginStatus(email: string): Promise<LoginStatus> {
  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  if (!user) return 'not_found'
  if (!user.emailVerified) return 'not_verified'
  return 'wrong_password'
}
