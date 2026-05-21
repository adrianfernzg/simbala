'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCart } from '@/components/cart/CartProvider'
import { use } from 'react'

type Props = {
  params: Promise<{ locale: string }>
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export default function CartPage({ params }: Props) {
  const { locale } = use(params)
  const t = useTranslations('cart')
  const { items, totalPrice, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="border border-border py-24 text-center w-full max-w-lg">
          <svg className="mx-auto mb-6 h-16 w-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <p className="text-xs uppercase tracking-widest text-text-muted">{t('empty')}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-8 inline-block border border-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
          >
            Ver catálogo
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Tu selección</p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-px bg-border">
          {items.map((item) => {
            const itemUnitPrice = item.basePrice + item.selectedExtras.reduce((s, e) => s + e.price, 0)
            return (
              <div key={item.id} className="flex gap-5 bg-bg p-5">
                {/* Imagen */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface-raised border border-border">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-8 w-8 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 5 L18 5 L20 8 L20 18 L18 20 L10 20 L8 18 L8 8 Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-text-primary">{item.productName}</h2>
                      {item.selectedExtras.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {item.selectedExtras.map((e) => (
                            <li key={e.extraId} className="text-[10px] text-text-muted">
                              + {e.extraName} ({formatPrice(e.price)})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gold">
                      {formatPrice(itemUnitPrice * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center border border-border text-text-secondary hover:border-gold hover:text-gold transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs font-medium text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center border border-border text-text-secondary hover:border-gold hover:text-gold transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] uppercase tracking-widest text-text-muted hover:text-red-400 transition-colors"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumen */}
        <aside className="border border-border bg-surface p-6 h-fit">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-6">Resumen</p>

          <div className="space-y-3 border-b border-border pb-6">
            {items.map((item) => {
              const unitPrice = item.basePrice + item.selectedExtras.reduce((s, e) => s + e.price, 0)
              return (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-text-secondary">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-text-primary font-medium">
                    {formatPrice(unitPrice * item.quantity)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-text-muted">{t('total')}</span>
            <span className="text-2xl font-bold text-gold">{formatPrice(totalPrice)}</span>
          </div>

          <p className="mt-2 text-[10px] text-text-muted">IVA incluido. Envío gestionado manualmente.</p>

          <Link
            href={`/${locale}/checkout`}
            className="mt-8 block w-full bg-gold py-4 text-center text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
          >
            {t('checkout')} ›
          </Link>

          <Link
            href={`/${locale}/products`}
            className="mt-3 block w-full border border-border py-3 text-center text-xs uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}
