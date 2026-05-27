import Image from 'next/image'
import Link from 'next/link'

type Media = { url?: string | null; alt?: string }
type Category = { id: string; name: string; slug: string }

type PayloadProduct = {
  id: string
  name: string
  slug: string
  basePrice: number
  images?: Array<{ image: Media | string }>
  category: Category | string
}

interface ProductCardProps {
  product: PayloadProduct
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const price = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    Number(product.basePrice)
  )

  const firstImage = product.images?.[0]?.image
  const imageUrl = typeof firstImage === 'object' ? firstImage?.url : null
  const imageAlt = typeof firstImage === 'object' ? (firstImage?.alt ?? product.name) : product.name
  const categoryName = typeof product.category === 'object' ? product.category.name : ''

  return (
    <article className="group flex flex-col overflow-hidden bg-surface pixel-box">
      {/* Imagen con scanlines */}
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-surface-raised scanlines"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${imageAlt} — Simbala Arcade`}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-gold opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gold gradient bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {/* INSERT COIN badge */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="font-pixel bg-gold text-black px-2 py-1 blink"
            style={{ fontSize: '7px' }}
          >
            VER
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {categoryName && (
          <p className="font-pixel text-gold mb-2" style={{ fontSize: '7px', letterSpacing: '0.1em' }}>
            ▸ {categoryName.toUpperCase()}
          </p>
        )}
        <h2 className="font-arcade text-lg text-text-primary group-hover:text-gold transition-colors duration-200 leading-tight">
          <Link href={`/${locale}/product/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <p className="mt-2 text-xs text-text-muted uppercase tracking-widest">
          desde{' '}
          <span className="font-pixel text-gold glow-gold" style={{ fontSize: '10px' }}>
            {price}
          </span>
        </p>

        <div className="mt-auto pt-5">
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="block w-full py-3 text-center text-xs font-bold uppercase tracking-widest text-black bg-gold hover:bg-gold-light transition-colors duration-150 pixel-box-gold active:translate-y-0.5 active:shadow-none"
          >
            ▶ Personalizar
          </Link>
        </div>
      </div>
    </article>
  )
}
