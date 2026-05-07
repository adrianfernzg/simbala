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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/${locale}/product/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={`${product.name} — máquina recreativa`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-16 w-16 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {product.category.name}
        </p>
        <h2 className="mt-1 text-base font-semibold text-zinc-900 line-clamp-2">
          <Link href={`/${locale}/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-zinc-900">{price}</p>
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  )
}
