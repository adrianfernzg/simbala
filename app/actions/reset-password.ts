'use server'

import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { sendPasswordResetCode } from '@/lib/email'
import { emailRatelimit, codeRatelimit } from '@/lib/ratelimit'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

type Result = { ok: true } | { error: string }

const requestSchema = z.object({
  email: z.string().email(),
})

const confirmSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

async function getIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for') ?? 'anonymous'
}

export async function requestPasswordReset(data: unknown): Promise<Result> {
  try {
    const ip = await getIp()
    const parsed = requestSchema.safeParse(data)
    if (!parsed.success) return { error: 'Email inválido.' }

    const { success } = await emailRatelimit.limit(`reset-request:${ip}`)
    if (!success) return { error: 'Has solicitado demasiados códigos. Espera 1 hora.' }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        password: true,
        accounts: { select: { provider: true } },
      },
    })

    if (!user) return { error: 'No existe ninguna cuenta con ese email.' }

    const hasGoogle = user.accounts.some((a) => a.provider === 'google')
    if (!user.password && hasGoogle) {
      return { error: 'Esta cuenta usa Google. Inicia sesión con el botón de Google, no necesitas contraseña.' }
    }

    if (!user.emailVerified) {
      return { error: 'Esta cuenta aún no está verificada. Verifica tu email antes de cambiar la contraseña.' }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 60 * 60 * 1000)

    await db.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: code, resetPasswordTokenExpiry: expiry },
    })

    try {
      await sendPasswordResetCode({ email: user.email, name: user.name ?? user.email, code })
    } catch {
      return { error: 'No se pudo enviar el email. Inténtalo de nuevo.' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[reset-password] requestPasswordReset threw:', err)
    return { error: 'Ha ocurrido un error. Inténtalo de nuevo.' }
  }
}

export async function confirmPasswordReset(data: unknown): Promise<Result> {
  try {
    const ip = await getIp()
    const parsed = confirmSchema.safeParse(data)
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? 'Datos inválidos.'
      return { error: msg }
    }

    const { success } = await codeRatelimit.limit(`reset-confirm:${ip}:${parsed.data.email}`)
    if (!success) return { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, resetPasswordToken: true, resetPasswordTokenExpiry: true },
    })

    if (!user || !user.resetPasswordToken) {
      return { error: 'Código no válido o ya utilizado.' }
    }

    if (!crypto.timingSafeEqual(Buffer.from(user.resetPasswordToken), Buffer.from(parsed.data.code))) {
      return { error: 'Código incorrecto. Compruébalo o solicita uno nuevo.' }
    }

    if (!user.resetPasswordTokenExpiry || user.resetPasswordTokenExpiry < new Date()) {
      return { error: 'El código ha expirado. Solicita uno nuevo.' }
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
  } catch (err) {
    console.error('[reset-password] confirmPasswordReset error:', err)
    return { error: 'Ha ocurrido un error. Inténtalo de nuevo.' }
  }
}
