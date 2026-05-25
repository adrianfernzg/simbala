'use server'

import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

const resendSchema = z.object({
  email: z.string().email(),
})

type Result = { ok: true } | { error: string }

export async function verifyEmailCode(data: unknown): Promise<Result> {
  const parsed = verifySchema.safeParse(data)
  if (!parsed.success) return { error: 'Código inválido.' }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, emailVerified: true, verificationToken: true, verificationTokenExpiry: true },
  })

  if (!user) return { error: 'No existe ninguna cuenta con ese email.' }
  if (user.emailVerified) return { ok: true }

  if (!user.verificationToken || user.verificationToken !== parsed.data.code) {
    return { error: 'Código incorrecto. Compruébalo o solicita uno nuevo.' }
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return { error: 'El código ha expirado. Solicita uno nuevo.' }
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  })

  return { ok: true }
}

export async function resendVerificationCode(data: unknown): Promise<Result> {
  const parsed = resendSchema.safeParse(data)
  if (!parsed.success) return { error: 'Email inválido.' }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, emailVerified: true },
  })

  if (!user) return { error: 'No existe ninguna cuenta con ese email.' }
  if (user.emailVerified) return { ok: true }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.user.update({
    where: { id: user.id },
    data: { verificationToken: code, verificationTokenExpiry: expiry },
  })

  try {
    await sendVerificationEmail({ email: user.email, name: user.name ?? user.email, code })
  } catch {
    return { error: 'No se pudo enviar el email. Inténtalo de nuevo.' }
  }

  return { ok: true }
}
