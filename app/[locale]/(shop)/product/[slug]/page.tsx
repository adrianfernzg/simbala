import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/Badge'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const product = await db.product.findUnique({ where: { slug, published: true } })
  if (!product) return { title: 'Producto no encontrado' }

  const title = product.name
  const description = product.description.slice(0, 160)
  const image = product.images[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/product/${slug}`,
      languages: {
        es: `${process.env.NEXT_PUBLIC_APP_URL}/es/product/${slug}`,
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/product/${slug}`,
      },
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'product' })

  const product = await db.product.findUnique({
    where: { slug, published: true },
    include: { category: true, extras: true },
  })

  if (!product) notFound()

  const basePrice = Number(product.basePrice)
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <a href={`/${locale}/products`} className="hover:text-zinc-900">Productos</a>
        <span>/</span>
        <a href={`/${locale}/products?categoria=${product.category.slug}`} className="hover:text-zinc-900">
          {product.category.name}
        </a>
        <span>/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={`${product.name} — máquina recreativa`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-24 w-24 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </figure>

          {product.images.length > 1 && (
            <ul className="grid grid-cols-4 gap-2" aria-label="Miniaturas">
              {product.images.slice(1, 5).map((img, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                  <Image
                    src={img}
                    alt={`${product.name} imagen ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex flex-col">
          <Badge variant="default">{product.category.name}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-zinc-900">{product.name}</h1>

          <p className="mt-4 text-3xl font-bold text-zinc-900">{formatPrice(basePrice)}</p>

          <p className="mt-6 text-sm leading-relaxed text-zinc-600">{product.description}</p>

          {/* Extras */}
          {product.extras.length > 0 && (
            <aside className="mt-8">
              <h2 className="text-base font-semibold text-zinc-900">{t('extras')}</h2>
              <ul className="mt-4 space-y-3">
                {product.extras.map((extra) => (
                  <li key={extra.id} className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{extra.name}</p>
                      {extra.description && (
                        <p className="mt-0.5 text-xs text-zinc-500">{extra.description}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-zinc-900">
                      +{formatPrice(Number(extra.price))}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Botón añadir al carrito — placeholder hasta implementar carrito */}
          <div className="mt-8">
            <button
              type="button"
              className="w-full rounded-md bg-zinc-900 px-6 py-3 text-base font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {t('addToCart')}
            </button>
          </div>

          {/* Info de envío */}
          <div className="mt-6 rounded-lg border border-zinc-200 p-4">
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Envío a toda España
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Recogida en taller disponible
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Pago seguro con Stripe
              </li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}
