import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db'
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

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })

  const where = {
    published: true,
    ...(categoria ? { category: { slug: categoria } } : {}),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const t = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Encabezado */}
      <div className="border-b border-border pb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">The Collection</p>
        <h1 className="mt-3 text-4xl font-bold text-text-primary">{t('products')}</h1>
        <p className="mt-3 text-sm text-text-secondary">
          {total} {total === 1 ? 'modelo disponible' : 'modelos disponibles'}
        </p>
      </div>

      {/* Filtros */}
      {categories.length > 0 && (
        <nav aria-label="Filtro por categoría" className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-text-muted mr-2">Filter:</span>
          <a
            href={`/${locale}/products`}
            className={[
              'px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-all duration-200',
              !categoria
                ? 'bg-gold text-black'
                : 'border border-border text-text-secondary hover:border-gold hover:text-gold',
            ].join(' ')}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/${locale}/products?categoria=${cat.slug}`}
              className={[
                'px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-all duration-200',
                categoria === cat.slug
                  ? 'bg-gold text-black'
                  : 'border border-border text-text-secondary hover:border-gold hover:text-gold',
              ].join(' ')}
            >
              {cat.name}
            </a>
          ))}
        </nav>
      )}

      {/* Grid */}
      {products.length > 0 ? (
        <>
          <ul className="mt-10 grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="bg-bg">
                <ProductCard product={product} locale={locale} />
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
                      : 'border border-border text-text-secondary hover:border-gold hover:text-gold',
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
        <div className="mt-20 border border-border py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            No hay modelos disponibles todavía
          </p>
        </div>
      )}
    </section>
  )
}
