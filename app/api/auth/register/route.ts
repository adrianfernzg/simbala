import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { ratelimit } from '@/lib/ratelimit'
import { sendVerificationEmail } from '@/lib/email'
import { getPayload } from 'payload'
import config from '@payload-config'

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  try {
    const { success } = await ratelimit.limit(`register:${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }
  } catch {
    // Si Upstash falla, continuar sin rate limiting
  }

  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.website) {
    return NextResponse.json({ error: 'Bot detectado' }, { status: 400 })
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (existingUser) {
    if (!existingUser.emailVerified) {
      const code = generateVerificationCode()
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await db.user.update({
        where: { id: existingUser.id },
        data: { verificationToken: code, verificationTokenExpiry: expiry },
      })
      try {
        await sendVerificationEmail({ email: existingUser.email, name: existingUser.name ?? existingUser.email, code })
      } catch (err) {
        console.error('[register] sendVerificationEmail error (resend):', err)
        return NextResponse.json({ error: 'No se pudo enviar el email de verificación. Inténtalo de nuevo.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)
  const code = generateVerificationCode()
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      verificationToken: code,
      verificationTokenExpiry: expiry,
    },
    select: { id: true, email: true, name: true },
  })

  try {
    await sendVerificationEmail({ email: user.email, name: user.name ?? user.email, code })
  } catch (err) {
    console.error('[register] sendVerificationEmail error:', err)
    await db.user.delete({ where: { id: user.id } })
    return NextResponse.json({ error: 'No se pudo enviar el email de verificación. Inténtalo de nuevo.' }, { status: 500 })
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'clientes',
      overrideAccess: true,
      data: {
        email: user.email,
        name: user.name ?? '',
        prismaUserId: user.id,
        provider: 'credentials',
      },
    })
  } catch {
    // No bloquear el registro si falla el sync con Payload
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
