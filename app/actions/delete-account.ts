'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type Result = { ok: true } | { error: string }

export async function deleteAccount(): Promise<Result> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  await db.user.delete({ where: { id: session.user.id } })

  return { ok: true }
}
