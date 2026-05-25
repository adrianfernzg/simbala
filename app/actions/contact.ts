'use server'

import { z } from 'zod'
import { sendContactEmail } from '@/lib/email'

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
})

type ContactResult = { ok: true } | { error: string }

export async function submitContact(data: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Por favor revisa los campos del formulario.' }
  }

  try {
    await sendContactEmail(parsed.data)
    return { ok: true }
  } catch (err) {
    console.error('[contact] sendContactEmail error:', err)
    return { error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbenos directamente a hola@simbalarcade.com.' }
  }
}
