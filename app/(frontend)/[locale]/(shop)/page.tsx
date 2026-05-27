import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductCard } from '@/components/shop/ProductCard'
import { TetrisBackground } from '@/components/shop/TetrisBackground'
import { Ticker } from '@/components/shop/Ticker'
import { BorderOrb } from '@/components/shop/BorderOrb'

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
      <section className="relative overflow-hidden border-b-2 border-border scanlines px-4 py-28 sm:px-6 lg:px-8">
        {/* Tetris animation */}
        <TetrisBackground />

        {/* Overlay gradient so text is readable over tetris */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(10,10,10,0.85),rgba(10,10,10,0.5))]" />

        {/* Decorative corners */}
        <div className="pointer-events-none absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-gold opacity-30 z-10" />
        <div className="pointer-events-none absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-gold opacity-30 z-10" />

        <div className="relative mx-auto max-w-4xl text-center z-10">
          <p className="font-pixel text-gold glow-gold mb-6 inline-block" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
            ✦ INSERT COIN TO PLAY ✦
          </p>
          <h1 className="font-pixel text-text-primary leading-loose" style={{ fontSize: 'clamp(1.4rem, 4vw, 2.8rem)' }}>
            Entretenimiento eterno,{' '}
            <span className="text-gold glow-gold">artesanía moderna.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-text-secondary" style={{ fontSize: '1.3rem' }}>
            Máquinas recreativas artesanales de alta gama. Fabricadas en Valencia con
            materiales premium. Envío a toda España o recogida en taller.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/products`}
              className="pixel-box-gold bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors active:translate-y-0.5"
            >
              ▶ Ver catálogo
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="pixel-box px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-gold transition-all"
            >
              Contacto
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────── */}
      <Ticker />

      {/* ── Productos destacados ──────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="font-pixel text-gold mb-3" style={{ fontSize: '8px', letterSpacing: '0.15em' }}>
                ▸ NUESTROS MODELOS
              </p>
              <h2 className="font-arcade text-3xl text-text-primary">Colección Destacada</h2>
            </div>
            <Link
              href={`/${locale}/products`}
              className="text-xs uppercase tracking-widest text-text-secondary hover:text-gold transition-colors font-semibold"
            >
              Ver todos →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} locale={locale} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="pixel-box py-24 text-center">
              <p className="font-pixel text-text-muted" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
                CATÁLOGO PRÓXIMAMENTE
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Ventajas ─────────────────────────────────────────── */}
      <section className="border-t-2 border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🚚',
                number: '01',
                title: 'Envío a toda España',
                desc: 'Gestionamos el transporte desde nuestro taller hasta tu puerta.',
              },
              {
                icon: '🏭',
                number: '02',
                title: 'Recogida en taller',
                desc: 'Visita nuestro taller en Valencia y recoge tu máquina sin coste adicional.',
              },
              {
                icon: '🔒',
                number: '03',
                title: 'Compra segura',
                desc: 'Pago 100% seguro con Stripe. Garantía en todos los productos.',
              },
            ].map(({ icon, number, title, desc }) => (
              <li key={number} className="pixel-box pixel-corners p-8 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-pixel text-gold" style={{ fontSize: '8px' }}>{number}</span>
                </div>
                <h3 className="font-arcade text-lg text-text-primary">{title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="border-t-2 border-border px-4 py-24 sm:px-6 lg:px-8">
        <BorderOrb className="mx-auto max-w-3xl text-center p-12">
          <p className="font-pixel text-gold glow-gold mb-5" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
            ✦ PERSONALIZACIÓN ✦
          </p>
          <h2 className="font-arcade text-4xl text-text-primary">
            Diseña tu máquina recreativa ideal
          </h2>
          <p className="mt-5 text-sm text-text-secondary">
            Fabricada a mano en Valencia. Plazo habitual de entrega: 8–12 semanas.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="mt-8 inline-block pixel-box-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
          >
            ▶ Solicitar información
          </Link>
        </BorderOrb>
      </section>
    </>
  )
}
