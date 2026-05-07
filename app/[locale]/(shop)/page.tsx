import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/shop/ProductCard'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'navigation' })

  const featuredProducts = await db.product.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-900 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Máquinas recreativas de calidad
          </h1>
          <p className="mt-6 text-lg text-zinc-300">
            Amplio catálogo de máquinas recreativas. Envío a toda España o recogida en nuestro taller.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/products`}
              className="rounded-md bg-white px-6 py-3 text-base font-medium text-zinc-900 hover:bg-zinc-100"
            >
              {t('products')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="rounded-md border border-zinc-600 px-6 py-3 text-base font-medium text-white hover:bg-zinc-800"
            >
              {t('contact')}
            </Link>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      {featuredProducts.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">Productos destacados</h2>
              <Link
                href={`/${locale}/products`}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Ver todos →
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA — sin productos aún */}
      {featuredProducts.length === 0 && (
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-2xl font-bold text-zinc-900">Catálogo próximamente</h2>
            <p className="mt-4 text-zinc-500">
              Estamos preparando el catálogo. Vuelve pronto.
            </p>
          </div>
        </section>
      )}

      {/* Ventajas */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: '🚚',
                title: 'Envío a toda España',
                desc: 'Gestionamos el envío desde nuestro taller hasta tu puerta.',
              },
              {
                icon: '🔧',
                title: 'Recogida en taller',
                desc: 'Pasa por nuestro taller y recoge tu máquina sin coste adicional.',
              },
              {
                icon: '🛡️',
                title: 'Compra segura',
                desc: 'Pago 100% seguro con Stripe. Garantía en todos los productos.',
              },
            ].map(({ icon, title, desc }) => (
              <li key={title} className="flex flex-col items-center text-center">
                <span className="text-4xl">{icon}</span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
