import Image from 'next/image'
import Link from 'next/link'
import type { Product, Category } from '@prisma/client'

type ProductWithCategory = Product & { category: Category }

interface ProductCardProps {
  product: ProductWithCategory
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const price = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    Number(product.basePrice)
  )

  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_30px_rgba(212,160,23,0.08)]">
      {/* Imagen */}
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-surface-raised"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={`${product.name} — Simbala Arcade`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75}
                d="M10 5 L18 5 L20 8 L20 18 L18 20 L10 20 L8 18 L8 8 Z M10 10 h8 M12 15 h2 M15 15 h1" />
            </svg>
          </div>
        )}

        {/* Overlay de categoría */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gold">
          {product.category.name}
        </p>
        <h2 className="mt-2 text-base font-semibold text-text-primary line-clamp-2 group-hover:text-gold transition-colors duration-200">
          <Link href={`/${locale}/product/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          From <span className="text-gold font-medium">{price}</span>
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
