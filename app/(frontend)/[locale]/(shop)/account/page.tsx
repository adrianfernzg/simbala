import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Badge } from '@/components/ui/Badge'
import { LogoutButton } from '@/components/shop/LogoutButton'

type Props = {
  params: Promise<{ locale: string }>
}

const formatPrice = (n: number | string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n))

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusVariant: Record<string, 'gold' | 'dark' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  let session = null
  try { session = await auth() } catch { /* ignorar */ }
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const payload = await getPayload({ config })
  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: { userId: { equals: session.user.id } },
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Tu cuenta</p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary">
          {session.user.name ?? session.user.email}
        </h1>
        <p className="mt-1 text-xs text-text-muted">{session.user.email}</p>
      </div>

      {/* Pedidos */}
      <div className="mt-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-6">
          Mis pedidos ({orders.length})
        </p>

        {orders.length === 0 ? (
          <div className="border border-border py-24 text-center">
            <p className="text-xs uppercase tracking-widest text-text-muted">
              No tienes pedidos todavía
            </p>
            <Link
              href={`/${locale}/products`}
              className="mt-8 inline-block border border-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-px bg-border">
            {orders.map((order) => {
              const items = (order.items ?? []) as Array<{
                id: string; productName: string; quantity: number; totalPrice: number
                extras: Array<{ id: string; extraName: string; value?: string }>
              }>
              const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
              const currentIdx = statuses.indexOf(order.status as string)
              return (
                <li key={order.id} className="bg-bg">
                  <div className="p-6">
                    {/* Cabecera del pedido */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-medium text-text-primary">
                            Pedido #{String(order.id).slice(-8).toUpperCase()}
                          </p>
                          <Badge variant={statusVariant[order.status as string] ?? 'dark'}>
                            {statusLabel[order.status as string] ?? order.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[10px] text-text-muted">
                          {formatDate(new Date(order.createdAt as string))}
                          {order.isPickup ? ' · Recogida en taller' : ' · Envío a domicilio'}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gold">
                        {formatPrice(order.totalAmount as number)}
                      </p>
                    </div>

                    {/* Items del pedido */}
                    <ul className="mt-5 divide-y divide-border">
                      {items.map((item, idx) => (
                        <li key={item.id ?? idx} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {item.productName}
                                {item.quantity > 1 && (
                                  <span className="ml-2 text-xs text-text-muted">× {item.quantity}</span>
                                )}
                              </p>
                              {item.extras?.length > 0 && (
                                <ul className="mt-1 flex flex-wrap gap-2">
                                  {item.extras.map((extra, ei) => (
                                    <li
                                      key={extra.id ?? ei}
                                      className="text-[10px] text-text-muted border border-border px-2 py-0.5"
                                    >
                                      {extra.extraName}
                                      {extra.value ? `: ${extra.value}` : ''}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <p className="text-sm font-medium text-text-primary shrink-0">
                              {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Timeline de estado */}
                    <div className="mt-5 border-t border-border pt-5">
                      <div className="flex items-center gap-0">
                        {statuses.map((s, i) => {
                          const isDone = i <= currentIdx && order.status !== 'CANCELLED'
                          const isLast = i === statuses.length - 1
                          return (
                            <div key={s} className="flex flex-1 items-center">
                              <div className={[
                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                isDone ? 'bg-gold' : 'bg-border',
                              ].join(' ')} />
                              {!isLast && (
                                <div className={[
                                  'h-px flex-1',
                                  i < currentIdx && order.status !== 'CANCELLED' ? 'bg-gold/50' : 'bg-border',
                                ].join(' ')} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 flex justify-between">
                        {['Pendiente', 'Preparando', 'Enviado', 'Entregado'].map((label) => (
                          <p key={label} className="text-[9px] uppercase tracking-wider text-text-muted">
                            {label}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="mt-16 border-t border-border pt-8">
        <LogoutButton locale={locale} />
      </div>
    </section>
  )
}
