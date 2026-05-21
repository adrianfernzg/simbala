import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductCard } from '@/components/shop/ProductCard'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params

  let featuredProducts: Parameters<typeof ProductCard>[0]['product'][] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: { published: { equals: true } },
      sort: '-createdAt',
      limit: 3,
      depth: 1,
      locale: locale as 'es' | 'en',
    })
    featuredProducts = result.docs as unknown as typeof featuredProducts
  } catch (err) {
    console.error('[HomePage] Payload error:', err)
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border px-4 py-32 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,160,23,0.08),transparent)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-gold">
            La Colección
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Entretenimiento eterno,{' '}
            <span className="text-gold">artesanía moderna.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-text-secondary">
            Máquinas recreativas artesanales de alta gama. Fabricadas en Valencia con
            materiales premium. Envío a toda España o recogida en taller.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/products`}
              className="border border-gold bg-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
            >
              Ver catálogo
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="border border-border px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
            >
              Contacto
            </Link>
          </div>
        </div>
      </section>

      {/* ── Productos destacados ──────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Nuestros modelos</p>
              <h2 className="mt-2 text-3xl font-bold text-text-primary">Colección destacada</h2>
            </div>
            <Link
              href={`/${locale}/products`}
              className="text-xs uppercase tracking-widest text-text-secondary hover:text-gold transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <li key={product.id} className="bg-bg">
                  <ProductCard product={product} locale={locale} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-border py-24 text-center">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                Catálogo próximamente
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Ventajas ─────────────────────────────────────────── */}
      <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              {
                number: '01',
                title: 'Envío a toda España',
                desc: 'Gestionamos el transporte desde nuestro taller hasta tu puerta.',
              },
              {
                number: '02',
                title: 'Recogida en taller',
                desc: 'Visita nuestro taller en Valencia y recoge tu máquina sin coste adicional.',
              },
              {
                number: '03',
                title: 'Compra segura',
                desc: 'Pago 100% seguro con Stripe. Garantía en todos los productos.',
              },
            ].map(({ number, title, desc }) => (
              <li key={number} className="flex flex-col px-8 py-10 first:pl-0 last:pr-0 sm:px-10">
                <span className="text-xs font-medium tracking-widest text-gold">{number}</span>
                <h3 className="mt-3 text-base font-semibold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Personalización</p>
          <h2 className="mt-4 text-4xl font-bold text-text-primary">
            Diseña tu máquina recreativa ideal
          </h2>
          <p className="mt-5 text-base text-text-secondary">
            Fabricada a mano en Valencia. Plazo habitual de entrega: 8–12 semanas.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="mt-8 inline-block border border-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
          >
            Solicitar información
          </Link>
        </div>
      </section>
    </>
  )
}
