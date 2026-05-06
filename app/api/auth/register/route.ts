import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(`register:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
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
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json(user, { status: 201 })
}
