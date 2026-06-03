'use server'

import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { codeRatelimit, emailRatelimit } from '@/lib/ratelimit'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

const resendSchema = z.object({
  email: z.string().email(),
})

type Result = { ok: true } | { error: string }

async function getIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for') ?? 'anonymous'
}

export async function verifyEmailCode(data: unknown): Promise<Result> {
  try {
    const ip = await getIp()
    const parsed = verifySchema.safeParse(data)
    if (!parsed.success) return { error: 'Código inválido.' }

    // Rate limit per IP + per email to prevent brute force
    const { success } = await codeRatelimit.limit(`verify:${ip}:${parsed.data.email}`)
    if (!success) return { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' }

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
  } catch {
    return { error: 'Ha ocurrido un error. Inténtalo de nuevo.' }
  }
}

export async function resendVerificationCode(data: unknown): Promise<Result> {
  try {
    const ip = await getIp()
    const parsed = resendSchema.safeParse(data)
    if (!parsed.success) return { error: 'Email inválido.' }

    const { success } = await emailRatelimit.limit(`resend-verify:${ip}`)
    if (!success) return { error: 'Has solicitado demasiados códigos. Espera 1 hora.' }

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
  } catch {
    return { error: 'Ha ocurrido un error. Inténtalo de nuevo.' }
  }
}
