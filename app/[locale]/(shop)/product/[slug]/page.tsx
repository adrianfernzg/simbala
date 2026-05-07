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
  if (!product) return { title: 'Modelo no encontrado' }

  const title = `${product.name} | Simbala Arcade`
  const description = product.description.slice(0, 160)
  const image = product.images[0]

  return {
    title: product.name,
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
      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-text-muted">
        <a href={`/${locale}/products`} className="uppercase tracking-widest hover:text-gold transition-colors">
          Modelos
        </a>
        <span className="text-border">—</span>
        <a href={`/${locale}/products?categoria=${product.category.slug}`} className="uppercase tracking-widest hover:text-gold transition-colors">
          {product.category.name}
        </a>
        <span className="text-border">—</span>
        <span className="uppercase tracking-widest text-text-secondary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

        {/* Galería */}
        <div className="space-y-3">
          <figure className="relative aspect-[4/3] overflow-hidden border border-border bg-surface-raised">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={`${product.name} — Simbala Arcade`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <svg className="h-20 w-20 text-border" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="1">
                  <path d="M10 5 L22 5 L24.5 9 L24.5 22 L22 25 L10 25 L7.5 22 L7.5 9 Z" />
                  <rect x="11" y="9" width="10" height="6" />
                  <circle cx="14" cy="19.5" r="1.5" />
                </svg>
                <span className="text-[10px] uppercase tracking-widest text-text-muted">No image</span>
              </div>
            )}
            {/* Badge label */}
            <div className="absolute bottom-4 left-4">
              <div className="border border-gold/40 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-widest text-gold/70">Current Preview</p>
                <p className="text-sm font-semibold text-text-primary">{product.name}</p>
              </div>
            </div>
          </figure>

          {product.images.length > 1 && (
            <ul className="grid grid-cols-4 gap-2" aria-label="Miniaturas">
              {product.images.slice(1, 5).map((img, i) => (
                <li key={i} className="relative aspect-square overflow-hidden border border-border bg-surface-raised hover:border-gold/40 transition-colors">
                  <Image
                    src={img}
                    alt={`${product.name} imagen ${i + 2}`}
                    fill
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                    sizes="20vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <Badge variant="gold">{product.category.name}</Badge>
          <h1 className="mt-4 text-4xl font-bold text-text-primary">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-text-muted">Estimated Price</span>
            <span className="text-3xl font-bold text-gold">{formatPrice(basePrice)}</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-text-secondary">{product.description}</p>

          {/* Extras / Configuración */}
          {product.extras.length > 0 && (
            <aside className="mt-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-4">
                {t('extras')}
              </p>
              <ul className="space-y-2">
                {product.extras.map((extra) => (
                  <li
                    key={extra.id}
                    className="flex items-start justify-between gap-4 border border-border p-4 hover:border-gold/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{extra.name}</p>
                      {extra.description && (
                        <p className="mt-0.5 text-xs text-text-secondary">{extra.description}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gold">
                      +{formatPrice(Number(extra.price))}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Acciones */}
          <div className="mt-10 flex flex-col gap-3">
            <button
              type="button"
              className="w-full bg-gold py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
            >
              {t('addToCart')} ›
            </button>
            <button
              type="button"
              className="w-full border border-border py-4 text-sm font-medium uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
            >
              Book a Virtual Tour
            </button>
          </div>

          {/* Datos de envío */}
          <div className="mt-8 border-t border-border pt-6">
            <ul className="space-y-2.5">
              {[
                'Envío gestionado manualmente a toda España',
                'Recogida en taller — Valencia',
                'Pago 100% seguro con Stripe',
                'Fabricado artesanalmente en España',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="h-px w-4 bg-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-text-muted">
              Handcrafted in Spain. Typical delivery: 8–12 weeks.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
