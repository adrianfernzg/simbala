'use server'

import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

type Result = { ok: true } | { error: string }

const requestSchema = z.object({
  email: z.string().email(),
  locale: z.string().default('es'),
})

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/, 'Debe contener al menos una mayúscula').regex(/[0-9]/, 'Debe contener al menos un número'),
})

export async function requestPasswordReset(data: unknown): Promise<Result> {
  const parsed = requestSchema.safeParse(data)
  if (!parsed.success) return { error: 'Email inválido.' }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, emailVerified: true },
  })

  if (!user) return { error: 'No existe ninguna cuenta con ese email.' }
  if (!user.emailVerified) return { error: 'Esta cuenta aún no está verificada. Verifica tu email antes de cambiar la contraseña.' }

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000)

  await db.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: token, resetPasswordTokenExpiry: expiry },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const resetUrl = `${appUrl}/${parsed.data.locale}/reset-password/${token}`

  try {
    await sendPasswordResetEmail({ email: user.email, name: user.name ?? user.email, resetUrl })
  } catch {
    return { error: 'No se pudo enviar el email. Inténtalo de nuevo.' }
  }

  return { ok: true }
}

export async function confirmPasswordReset(data: unknown): Promise<Result> {
  const parsed = confirmSchema.safeParse(data)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Contraseña inválida.'
    return { error: msg }
  }

  const user = await db.user.findFirst({
    where: { resetPasswordToken: parsed.data.token },
    select: { id: true, resetPasswordTokenExpiry: true },
  })

  if (!user) return { error: 'El enlace no es válido o ya fue utilizado.' }

  if (!user.resetPasswordTokenExpiry || user.resetPasswordTokenExpiry < new Date()) {
    return { error: 'El enlace ha expirado. Solicita uno nuevo desde la página de inicio de sesión.' }
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  })

  return { ok: true }
}
