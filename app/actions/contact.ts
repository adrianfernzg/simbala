'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { sendContactEmail } from '@/lib/email'
import { ratelimit } from '@/lib/ratelimit'

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
})

type ContactResult = { ok: true } | { error: string }

export async function submitContact(data: unknown): Promise<ContactResult> {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await ratelimit.limit(`contact:${ip}`)
    if (!success) return { error: 'Demasiadas peticiones. Inténtalo más tarde.' }
  } catch {
    // Si Upstash falla, continuar
  }

  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Por favor revisa los campos del formulario.' }
  }

  try {
    await sendContactEmail(parsed.data)
    return { ok: true }
  } catch (err) {
    console.error('[contact] sendContactEmail error:', err)
    return { error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' }
  }
}
