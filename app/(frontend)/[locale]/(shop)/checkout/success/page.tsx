import Link from 'next/link'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { session_id } = await searchParams

  if (!session_id) redirect(`/${locale}`)

  let customerEmail = ''
  let orderTotal = ''

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    customerEmail = session.customer_details?.email ?? ''
    orderTotal = session.amount_total
      ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
          session.amount_total / 100
        )
      : ''
  } catch {
    redirect(`/${locale}`)
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icono check */}
      <div className="mb-8 flex h-20 w-20 items-center justify-center border border-gold/40 bg-surface">
        <svg className="h-9 w-9 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Pago confirmado</p>
      <h1 className="mt-4 text-3xl font-bold text-text-primary">¡Gracias por tu pedido!</h1>

      <p className="mt-5 max-w-md text-sm leading-relaxed text-text-secondary">
        Hemos recibido tu pago
        {orderTotal && <span className="text-text-primary font-medium"> de {orderTotal}</span>}.
        Nos pondremos en contacto contigo en las próximas horas para coordinar los detalles del envío.
      </p>

      {customerEmail && (
        <p className="mt-3 text-xs text-text-muted">
          Confirmación enviada a <span className="text-text-secondary">{customerEmail}</span>
        </p>
      )}

      <div className="mt-4 w-full max-w-sm border border-border bg-surface p-5 text-left">
        <ul className="space-y-2.5">
          {[
            'Recibirás email de confirmación con factura proforma',
            'El propietario revisará tu pedido manualmente',
            'Te contactaremos para coordinar la entrega o recogida',
            'Plazo habitual de fabricación: 8–12 semanas',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-xs text-text-secondary">
              <span className="mt-1.5 h-px w-3 bg-gold shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/${locale}/account`}
          className="border border-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
        >
          Ver mis pedidos
        </Link>
        <Link
          href={`/${locale}/products`}
          className="border border-border px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
        >
          Seguir explorando
        </Link>
      </div>
    </section>
  )
}
