'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, type CartExtra } from '@/components/cart/CartProvider'
import { useTranslations } from 'next-intl'

type Extra = {
  id: string
  name: string
  description: string | null
  price: number
}

interface AddToCartButtonProps {
  locale: string
  productId: string
  productName: string
  productSlug: string
  productImage: string | null
  basePrice: number
  extras: Extra[]
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export function AddToCartButton({
  locale,
  productId,
  productName,
  productSlug,
  productImage,
  basePrice,
  extras,
}: AddToCartButtonProps) {
  const t = useTranslations('product')
  const { addItem } = useCart()
  const router = useRouter()

  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState(false)

  function toggleExtra(extraId: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev)
      if (next.has(extraId)) next.delete(extraId)
      else next.add(extraId)
      return next
    })
  }

  const extrasTotal = extras
    .filter((e) => selectedExtras.has(e.id))
    .reduce((sum, e) => sum + e.price, 0)

  const totalPrice = basePrice + extrasTotal

  function handleAddToCart() {
    const cartExtras: CartExtra[] = extras
      .filter((e) => selectedExtras.has(e.id))
      .map((e) => ({ extraId: e.id, extraName: e.name, price: e.price }))

    addItem({
      productId,
      productName,
      productSlug,
      productImage,
      basePrice,
      selectedExtras: cartExtras,
      quantity: 1,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Extras / Configuración */}
      {extras.length > 0 && (
        <aside className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-4">
            {t('extras')}
          </p>
          <ul className="space-y-2">
            {extras.map((extra) => {
              const selected = selectedExtras.has(extra.id)
              return (
                <li
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={[
                    'flex cursor-pointer items-start justify-between gap-4 border p-4 transition-all select-none',
                    selected
                      ? 'border-gold bg-surface-raised'
                      : 'border-border hover:border-gold/30',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className={[
                      'mt-0.5 h-3.5 w-3.5 shrink-0 border transition-all',
                      selected ? 'border-gold bg-gold' : 'border-border',
                    ].join(' ')} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{extra.name}</p>
                      {extra.description && (
                        <p className="mt-0.5 text-xs text-text-secondary">{extra.description}</p>
                      )}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gold">
                    +{formatPrice(extra.price)}
                  </p>
                </li>
              )
            })}
          </ul>
        </aside>
      )}

      {/* Total dinámico */}
      {selectedExtras.size > 0 && (
        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-xs uppercase tracking-widest text-text-muted">Total configurado</span>
          <span className="text-2xl font-bold text-gold">{formatPrice(totalPrice)}</span>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className={[
            'w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors',
            added
              ? 'bg-green-700 text-white'
              : 'bg-gold text-black hover:bg-gold-light',
          ].join(' ')}
        >
          {added ? '✓ Añadido al carrito' : `${t('addToCart')} ›`}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/checkout`)}
          className="w-full border border-border py-4 text-sm font-medium uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  )
}
