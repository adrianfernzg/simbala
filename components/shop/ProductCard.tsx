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
    <article className="group flex flex-col overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_30px_rgba(212,160,23,0.08)]">
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-surface-raised"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${imageAlt} — Simbala Arcade`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {categoryName && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-gold">
            {categoryName}
          </p>
        )}
        <h2 className="mt-2 text-base font-semibold text-text-primary line-clamp-2 group-hover:text-gold transition-colors duration-200">
          <Link href={`/${locale}/product/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Desde <span className="text-gold font-medium">{price}</span>
        </p>

        <div className="mt-auto pt-5">
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="block w-full border border-gold py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
          >
            Personalizar
          </Link>
        </div>
      </div>
    </article>
  )
}
