import type { Metadata } from 'next'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductCard } from '@/components/shop/ProductCard'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ categoria?: string; pagina?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Modelos' : 'Models',
    description: locale === 'es'
      ? 'Catálogo completo de máquinas recreativas artesanales Simbala Arcade.'
      : 'Full catalogue of Simbala Arcade handcrafted arcade machines.',
  }
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { categoria, pagina } = await searchParams

  const page = Math.max(1, Number(pagina ?? 1))
  const pageSize = 12

  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    locale: locale as 'es' | 'en',
  })

  const where: Where = { published: { equals: true } }
  if (categoria) {
    where['category.slug'] = { equals: categoria }
  }

  const { docs: products, totalDocs } = await payload.find({
    collection: 'products',
    where,
    sort: '-createdAt',
    page,
    limit: pageSize,
    depth: 1,
    locale: locale as 'es' | 'en',
  })

  const totalPages = Math.ceil(totalDocs / pageSize)
  const count = String(totalDocs).padStart(2, '0')

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-0 sm:px-6 lg:px-8">
        <div className="relative pb-10">
          {/* Decorative numeric counter */}
          <div className="absolute top-0 right-0 text-right select-none" aria-hidden="true">
            <p className="font-pixel text-gold-muted" style={{ fontSize: '7px', letterSpacing: '0.2em' }}>
              {locale === 'es' ? 'MODELOS' : 'MODELS'}
            </p>
            <p className="font-arcade text-6xl text-gold glow-gold leading-none mt-1">{count}</p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            {locale === 'es' ? 'La Colección' : 'The Collection'}
          </p>
          <h1 className="mt-3 font-arcade text-4xl uppercase text-text-primary">
            {locale === 'es' ? 'Modelos' : 'Models'}
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-lg">
            {locale === 'es'
              ? 'Máquinas recreativas artesanales. Fabricadas en Valencia con materiales premium.'
              : 'Handcrafted arcade machines. Built in Valencia with premium materials.'}
          </p>
        </div>
        <div className="neon-divider" />
      </div>

      {/* ── Filtros + grid ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {categories.length > 0 && (
          <nav aria-label="Filtro por categoría" className="mb-10 flex flex-wrap items-center gap-2">
            <span className="font-pixel text-text-muted mr-2" style={{ fontSize: '7px', letterSpacing: '0.15em' }}>
              {locale === 'es' ? '▸ FILTRAR' : '▸ FILTER'}
            </span>
            <a
              href={`/${locale}/products`}
              className={[
                'px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-all duration-200',
                !categoria
                  ? 'bg-gold text-black'
                  : 'border border-gold/30 text-text-secondary hover:border-gold hover:text-gold',
              ].join(' ')}
            >
              {locale === 'es' ? 'Todos' : 'All'}
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/${locale}/products?categoria=${cat.slug}`}
                className={[
                  'px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-all duration-200',
                  categoria === cat.slug
                    ? 'bg-gold text-black'
                    : 'border border-gold/30 text-text-secondary hover:border-gold hover:text-gold',
                ].join(' ')}
              >
                {cat.name as string}
              </a>
            ))}
          </nav>
        )}

        {products.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product as Parameters<typeof ProductCard>[0]['product']} locale={locale} />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav aria-label="Paginación" className="mt-14 flex justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/${locale}/products?${categoria ? `categoria=${categoria}&` : ''}pagina=${p}`}
                    className={[
                      'flex h-9 w-9 items-center justify-center text-xs font-medium uppercase tracking-wider transition-all',
                      p === page
                        ? 'bg-gold text-black'
                        : 'border border-gold/30 text-text-secondary hover:border-gold hover:text-gold',
                    ].join(' ')}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </a>
                ))}
              </nav>
            )}
          </>
        ) : (
          <div className="pixel-box pixel-corners py-24 text-center">
            <p className="font-pixel text-text-muted" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
              {locale === 'es' ? 'NO HAY MODELOS DISPONIBLES' : 'NO MODELS AVAILABLE'}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
