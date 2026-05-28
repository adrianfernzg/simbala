import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Badge } from '@/components/ui/Badge'
import { ProductConfigurator, type VinylOption, type ConfigExtra, type SelectOption } from '@/components/shop/ProductConfigurator'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

type MediaSizes = {
  card?: { url?: string | null }
  og?: { url?: string | null }
}
type Media = { url?: string | null; alt?: string; sizes?: MediaSizes }

function getImageUrl(
  img: Media | string | null | undefined,
  prefer: 'card' | 'og' | 'original' = 'card',
): string | null {
  if (!img) return null
  if (typeof img === 'string') return img
  if (prefer !== 'original') {
    const sized = img.sizes?.[prefer]?.url
    if (sized) return sized
  }
  return img.url ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    depth: 0,
    locale: locale as 'es' | 'en',
  })
  const product = docs[0]
  if (!product) return { title: 'Modelo no encontrado' }

  const firstImage = product.images?.[0]?.image
  const imageUrl = getImageUrl(firstImage as Media | string | null, 'og')

  return {
    title: product.name as string,
    description: `${product.name} — Simbala Arcade. Máquina recreativa artesanal desde ${product.basePrice}€`,
    openGraph: {
      title: `${product.name} | Simbala Arcade`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
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
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    depth: 1,
    locale: locale as 'es' | 'en',
  })

  const product = docs[0]
  if (!product) notFound()

  const basePrice = Number(product.basePrice)

  const category = typeof product.category === 'object' ? product.category : null

  // Imágenes del producto — URL original de Cloudinary (sin recorte)
  const images: Array<string | null> = (product.images ?? []).map((img: Record<string, unknown>) =>
    getImageUrl(img.image as Media | string | null, 'original')
  )

  // Vinilos
  const vinyls: VinylOption[] = (product.vinyls ?? []).map((v: Record<string, unknown>) => ({
    id: String(v.id),
    name: v.name as string,
    imageUrl: getImageUrl(v.image as Media | string | null, 'card'),
    priceModifier: Number(v.priceModifier ?? 0),
  }))

  // Extras con opciones para selects
  const extras: ConfigExtra[] = (product.extras ?? []).map((e: Record<string, unknown>) => ({
    id: String(e.id),
    name: e.name as string,
    description: (e.description as string | undefined) ?? null,
    price: Number(e.price),
    type: e.type as 'checkbox' | 'select' | 'text',
    placeholder: (e.placeholder as string | undefined) ?? null,
    imageUrl: getImageUrl(e.image as Media | string | null, 'card'),
    options: ((e.options ?? []) as Array<Record<string, unknown>>).map(
      (o): SelectOption => ({
        id: String(o.id),
        label: o.label as string,
        value: o.value as string,
        priceModifier: Number(o.priceModifier ?? 0),
        imageUrl: getImageUrl(o.image as Media | string | null, 'card'),
      })
    ),
  }))

  // Descripción en HTML
  let descriptionHtml = ''
  if (product.description && typeof product.description === 'object') {
    try {
      descriptionHtml = await convertLexicalToHTML({
        data: product.description as Parameters<typeof convertLexicalToHTML>[0]['data'],
      })
    } catch {
      descriptionHtml = ''
    }
  } else if (typeof product.description === 'string') {
    descriptionHtml = product.description
  }

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-text-muted">
        <a href={`/${locale}/products`} className="uppercase tracking-widest hover:text-gold transition-colors">
          Modelos
        </a>
        <span className="text-border">—</span>
        {category && (
          <>
            <a
              href={`/${locale}/products?categoria=${category.slug}`}
              className="uppercase tracking-widest hover:text-gold transition-colors"
            >
              {category.name as string}
            </a>
            <span className="text-border">—</span>
          </>
        )}
        <span className="uppercase tracking-widest text-text-secondary">{product.name as string}</span>
      </nav>

      {/* Encabezado del producto (server-rendered para SEO) */}
      <div className="mb-10">
        {category && <Badge variant="gold">{category.name as string}</Badge>}
        <h1 className="mt-4 text-4xl font-bold text-text-primary">{product.name as string}</h1>
        {descriptionHtml && (
          <div
            className="prose-sm mt-5 max-w-2xl leading-relaxed text-text-secondary [&_p]:mb-3 [&_h2]:text-text-primary [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>

      {/* Configurador interactivo: galería + vinilo + extras + carrito */}
      <ProductConfigurator
        locale={locale}
        productId={String(product.id)}
        productName={product.name as string}
        productSlug={product.slug as string}
        basePrice={basePrice}
        images={images}
        vinyls={vinyls}
        extras={extras}
      />

      {/* Info de envío (server-rendered) */}
      <div className="mt-12 border-t border-border pt-8">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Envío gestionado manualmente a toda España',
            'Recogida en taller disponible — Valencia',
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
          Plazo habitual de fabricación: 8–12 semanas.
        </p>
      </div>
    </article>
  )
}
