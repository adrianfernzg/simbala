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
    title: locale === 'es' ? 'Productos — Catálogo' : 'Products — Catalogue',
    description: locale === 'es'
      ? 'Catálogo completo de máquinas recreativas.'
      : 'Full catalogue of arcade machines.',
  }
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { categoria, pagina } = await searchParams
  const t = await getTranslations({ locale, namespace: 'navigation' })

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

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">{t('products')}</h1>

      {/* Filtro por categoría */}
      {categories.length > 0 && (
        <nav aria-label="Filtro por categoría" className="mt-6 flex flex-wrap gap-2">
          <a
            href={`/${locale}/products`}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              !categoria ? 'bg-zinc-900 text-white' : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50',
            ].join(' ')}
          >
            Todos
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/${locale}/products?categoria=${cat.slug}`}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                categoria === cat.slug
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50',
              ].join(' ')}
            >
              {cat.name}
            </a>
          ))}
        </nav>
      )}

      {/* Grid de productos */}
      {products.length > 0 ? (
        <>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} locale={locale} />
              </li>
            ))}
          </ul>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/${locale}/products?${categoria ? `categoria=${categoria}&` : ''}pagina=${p}`}
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-zinc-900 text-white'
                      : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50',
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
        <div className="mt-16 text-center">
          <p className="text-zinc-500">No hay productos disponibles todavía.</p>
        </div>
      )}
    </section>
  )
}
