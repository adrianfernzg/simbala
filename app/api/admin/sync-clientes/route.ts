import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPayload } from 'payload'
import config from '@payload-config'

// Ruta de uso único: sincroniza usuarios de Prisma → Payload Clientes
// Solo accesible para admins. Llamar una vez tras el despliegue.
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, password: true },
  })

  const payload = await getPayload({ config })
  const results = { created: 0, skipped: 0, errors: 0 }

  for (const user of users) {
    try {
      const existing = await payload.find({
        collection: 'clientes',
        where: { email: { equals: user.email } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        results.skipped++
        continue
      }

      await payload.create({
        collection: 'clientes',
        overrideAccess: true,
        data: {
          email: user.email,
          name: user.name ?? '',
          prismaUserId: user.id,
          provider: user.password ? 'credentials' : 'google',
        },
      })
      results.created++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, total: users.length, ...results })
}
