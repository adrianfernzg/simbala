'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart, type CartExtra } from '@/components/cart/CartProvider'
import { useTranslations } from 'next-intl'

export type VinylOption = {
  id: string
  name: string
  imageUrl: string | null
  priceModifier: number
}

export type SelectOption = {
  id: string
  label: string
  value: string
  priceModifier: number
  imageUrl?: string | null
}

export type ConfigExtra = {
  id: string
  name: string
  description: string | null
  price: number
  type: 'checkbox' | 'select' | 'text'
  options?: SelectOption[]
  placeholder?: string | null
  imageUrl?: string | null
}

// La tira solo muestra imágenes del producto; los vinilos tienen su propio selector

interface ProductConfiguratorProps {
  locale: string
  productId: string
  productName: string
  productSlug: string
  basePrice: number
  images: Array<string | null>
  vinyls: VinylOption[]
  extras: ConfigExtra[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export function ProductConfigurator({
  locale,
  productId,
  productName,
  productSlug,
  basePrice,
  images,
  vinyls,
  extras,
}: ProductConfiguratorProps) {
  const t = useTranslations('product')
  const { addItem } = useCart()
  const router = useRouter()

  // Solo imágenes del producto en la tira de miniaturas
  const productImages = images.filter((u): u is string => !!u)

  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedVinylId, setSelectedVinylId] = useState<string | null>(null)
  const [checkedExtras, setCheckedExtras] = useState<Set<string>>(new Set())
  const [selectValues, setSelectValues] = useState<Map<string, string>>(new Map())
  const [textValues, setTextValues] = useState<Map<string, string>>(new Map())
  const [added, setAdded] = useState(false)

  const stripRef = useRef<HTMLUListElement>(null)

  const selectedVinyl = vinyls.find((v) => v.id === selectedVinylId) ?? null
  // Cuando hay vinilo seleccionado muestra su imagen; si no, la imagen del producto activa
  const activeImageUrl = selectedVinyl?.imageUrl ?? productImages[activeIdx] ?? null

  // ── Navegación galería (solo entre imágenes del producto) ─
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, productImages.length - 1))
      setActiveIdx(clamped)
      const strip = stripRef.current
      if (strip) {
        const thumb = strip.children[clamped] as HTMLElement | undefined
        thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    },
    [productImages.length]
  )

  const prev = () => goTo(activeIdx - 1)
  const next = () => goTo(activeIdx + 1)

  function handleVinylSectionClick(vinyl: VinylOption) {
    setSelectedVinylId((prev) => (prev === vinyl.id ? null : vinyl.id))
  }

  // ── Precio ───────────────────────────────────────────────
  const vinylPrice = selectedVinyl?.priceModifier ?? 0
  const extrasPrice = extras.reduce((sum, extra) => {
    if (extra.type === 'checkbox' && checkedExtras.has(extra.id)) return sum + extra.price
    if (extra.type === 'select') {
      const val = selectValues.get(extra.id)
      if (val) {
        const opt = extra.options?.find((o) => o.value === val)
        return sum + extra.price + (opt?.priceModifier ?? 0)
      }
    }
    if (extra.type === 'text' && textValues.get(extra.id)?.trim()) return sum + extra.price
    return sum
  }, 0)
  const totalPrice = basePrice + vinylPrice + extrasPrice

  // ── Cart ─────────────────────────────────────────────────
  function buildCartExtras(): CartExtra[] {
    const result: CartExtra[] = []
    if (selectedVinyl) {
      result.push({
        extraId: `vinyl_${selectedVinyl.id}`,
        extraName: `Vinilo: ${selectedVinyl.name}`,
        price: selectedVinyl.priceModifier,
        value: selectedVinyl.id,
      })
    }
    for (const extra of extras) {
      if (extra.type === 'checkbox' && checkedExtras.has(extra.id)) {
        result.push({ extraId: extra.id, extraName: extra.name, price: extra.price })
      }
      if (extra.type === 'select') {
        const val = selectValues.get(extra.id)
        if (val) {
          const opt = extra.options?.find((o) => o.value === val)
          if (opt) {
            result.push({
              extraId: extra.id,
              extraName: `${extra.name}: ${opt.label}`,
              price: extra.price + opt.priceModifier,
              value: val,
            })
          }
        }
      }
      if (extra.type === 'text') {
        const text = textValues.get(extra.id)?.trim()
        if (text) result.push({ extraId: extra.id, extraName: extra.name, price: extra.price, value: text })
      }
    }
    return result
  }

  function handleAddToCart() {
    addItem({
      productId,
      productName,
      productSlug,
      productImage: images[0] ?? null,
      basePrice,
      selectedExtras: buildCartExtras(),
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const hasConfig =
    !!selectedVinylId ||
    checkedExtras.size > 0 ||
    selectValues.size > 0 ||
    [...textValues.values()].some((v) => v.trim())

  const canPrev = activeIdx > 0
  const canNext = activeIdx < productImages.length - 1

  return (
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

      {/* ── Galería ──────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Imagen principal con flechas de navegación */}
        <figure className="group relative aspect-[682/980] overflow-hidden border border-border bg-surface-raised">
          {activeImageUrl ? (
            <Image
              src={activeImageUrl}
              alt={`${productName} — Simbala Arcade`}
              fill
              className="object-contain transition-opacity duration-300"
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
              <span className="text-[10px] uppercase tracking-widest text-text-muted">Sin imagen</span>
            </div>
          )}

          {/* Flechas — solo si hay más de 1 imagen de producto */}
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                disabled={!canPrev}
                aria-label="Imagen anterior"
                className={[
                  'absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center border border-border bg-black/60 backdrop-blur-sm transition-all',
                  canPrev
                    ? 'opacity-0 group-hover:opacity-100 hover:border-gold hover:text-gold text-text-secondary'
                    : 'opacity-0 cursor-default',
                ].join(' ')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                aria-label="Imagen siguiente"
                className={[
                  'absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center border border-border bg-black/60 backdrop-blur-sm transition-all',
                  canNext
                    ? 'opacity-0 group-hover:opacity-100 hover:border-gold hover:text-gold text-text-secondary'
                    : 'opacity-0 cursor-default',
                ].join(' ')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Badge contador */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 text-[9px] uppercase tracking-widest text-text-muted backdrop-blur-sm">
              {activeIdx + 1} / {productImages.length}
            </div>
          )}

          {/* Badge vinilo activo */}
          {selectedVinyl && (
            <div className="absolute bottom-3 left-3 border border-gold/40 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[9px] uppercase tracking-widest text-gold/70">Vinilo</p>
              <p className="text-sm font-semibold text-text-primary">{selectedVinyl.name}</p>
            </div>
          )}
        </figure>

        {/* Tira de miniaturas — solo imágenes del producto */}
        {productImages.length > 1 && (
          <div className="relative">
            <ul
              ref={stripRef}
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'thin' }}
              aria-label="Imágenes del producto"
            >
              {productImages.map((url, idx) => {
                const isActive = idx === activeIdx
                return (
                  <li key={idx} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTo(idx)}
                      className={[
                        'relative h-16 w-16 overflow-hidden border transition-all duration-200',
                        isActive ? 'border-gold' : 'border-border hover:border-gold/50',
                      ].join(' ')}
                      aria-label={`Imagen ${idx + 1}`}
                      aria-pressed={isActive}
                    >
                      <Image
                        src={url}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        className={[
                          'object-cover transition-opacity',
                          isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90',
                        ].join(' ')}
                        sizes="64px"
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ── Panel de configuración ───────────────────────────── */}
      <div className="flex flex-col">

        {/* Precio estimado */}
        <div className="flex items-baseline gap-3">
          <span className="text-xs uppercase tracking-widest text-text-muted">Precio estimado</span>
          <span className="text-3xl font-bold text-gold">{fmt(totalPrice)}</span>
        </div>

        {/* Selector de vinilo (si los hay) */}
        {vinyls.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Elige tu vinilo</p>
              {selectedVinyl && (
                <button
                  type="button"
                  onClick={() => { setSelectedVinylId(null); goTo(0) }}
                  className="text-[10px] uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Vinilos disponibles">
              {vinyls.map((vinyl) => {
                const sel = selectedVinylId === vinyl.id
                return (
                  <li key={vinyl.id}>
                    <button
                      type="button"
                      onClick={() => handleVinylSectionClick(vinyl)}
                      className={[
                        'group w-full overflow-hidden border transition-all duration-200',
                        sel ? 'border-gold ring-1 ring-gold/50' : 'border-border hover:border-gold/50',
                      ].join(' ')}
                      aria-pressed={sel}
                    >
                      <div className="relative aspect-square bg-surface-raised">
                        {vinyl.imageUrl ? (
                          <Image src={vinyl.imageUrl} alt={vinyl.name} fill className="object-cover" sizes="12vw" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-[8px] uppercase tracking-widest text-text-muted">Sin imagen</span>
                          </div>
                        )}
                        {sel && (
                          <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                              <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 text-center">
                        <p className="text-[9px] font-medium uppercase tracking-wider text-text-secondary line-clamp-1">{vinyl.name}</p>
                        <p className="text-[9px] text-gold">
                          {vinyl.priceModifier > 0 ? `+${fmt(vinyl.priceModifier)}` : 'Incluido'}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Extras */}
        {extras.length > 0 && (
          <section className="mt-8">
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-text-muted">{t('extras')}</p>
            <ul className="space-y-2">
              {extras.map((extra) => (
                <li key={extra.id} className="border border-border">

                  {/* Checkbox */}
                  {extra.type === 'checkbox' && (
                    <button
                      type="button"
                      onClick={() =>
                        setCheckedExtras((prev) => {
                          const next = new Set(prev)
                          next.has(extra.id) ? next.delete(extra.id) : next.add(extra.id)
                          return next
                        })
                      }
                      className={[
                        'flex w-full items-start justify-between gap-4 p-4 text-left transition-all',
                        checkedExtras.has(extra.id) ? 'bg-surface-raised' : 'hover:bg-surface-raised/40',
                      ].join(' ')}
                      aria-pressed={checkedExtras.has(extra.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={[
                          'mt-0.5 h-3.5 w-3.5 shrink-0 border transition-all',
                          checkedExtras.has(extra.id) ? 'border-gold bg-gold' : 'border-border',
                        ].join(' ')} />
                        {extra.imageUrl && (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border">
                            <Image src={extra.imageUrl} alt={extra.name} fill className="object-cover" sizes="48px" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{extra.name}</p>
                          {extra.description && (
                            <p className="mt-0.5 text-xs text-text-secondary">{extra.description}</p>
                          )}
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-gold">+{fmt(extra.price)}</p>
                    </button>
                  )}

                  {/* Select */}
                  {extra.type === 'select' && (
                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {extra.imageUrl && (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border">
                              <Image src={extra.imageUrl} alt={extra.name} fill className="object-cover" sizes="48px" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">{extra.name}</p>
                            {extra.description && (
                              <p className="mt-0.5 text-xs text-text-secondary">{extra.description}</p>
                            )}
                          </div>
                        </div>
                        {extra.price > 0 && (
                          <p className="shrink-0 text-sm font-semibold text-gold">+{fmt(extra.price)}</p>
                        )}
                      </div>
                      {extra.options && extra.options.length > 0 ? (
                        <ul className="space-y-1.5" aria-label={extra.name}>
                          {extra.options.map((opt) => {
                            const sel = selectValues.get(extra.id) === opt.value
                            return (
                              <li key={opt.id}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectValues((prev) => {
                                      const next = new Map(prev)
                                      if (next.get(extra.id) === opt.value) {
                                        next.delete(extra.id)
                                      } else {
                                        next.set(extra.id, opt.value)
                                      }
                                      return next
                                    })
                                  }
                                  className={[
                                    'flex w-full cursor-pointer items-center gap-3 border p-3 text-left transition-all',
                                    sel ? 'border-gold bg-surface-raised' : 'border-border hover:border-gold/30',
                                  ].join(' ')}
                                  aria-pressed={sel}
                                >
                                  <div className={[
                                    'h-3.5 w-3.5 shrink-0 rounded-full border transition-all',
                                    sel ? 'border-gold bg-gold' : 'border-border',
                                  ].join(' ')} />
                                  {opt.imageUrl && (
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border">
                                      <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" sizes="48px" />
                                    </div>
                                  )}
                                  <span className="text-sm text-text-primary">{opt.label}</span>
                                  {opt.priceModifier !== 0 && (
                                    <span className="ml-auto text-xs text-gold">
                                      {opt.priceModifier > 0 ? '+' : ''}{fmt(opt.priceModifier)}
                                    </span>
                                  )}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="text-xs italic text-text-muted">Sin opciones configuradas</p>
                      )}
                    </div>
                  )}

                  {/* Texto personalizado */}
                  {extra.type === 'text' && (
                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {extra.imageUrl && (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border">
                              <Image src={extra.imageUrl} alt={extra.name} fill className="object-cover" sizes="48px" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">{extra.name}</p>
                            {extra.description && (
                              <p className="mt-0.5 text-xs text-text-secondary">{extra.description}</p>
                            )}
                          </div>
                        </div>
                        {extra.price > 0 && (
                          <p className="shrink-0 text-sm font-semibold text-gold">+{fmt(extra.price)}</p>
                        )}
                      </div>
                      <input
                        type="text"
                        value={textValues.get(extra.id) ?? ''}
                        onChange={(e) =>
                          setTextValues((prev) => new Map(prev).set(extra.id, e.target.value))
                        }
                        placeholder={extra.placeholder ?? 'Escribe tu personalización…'}
                        maxLength={200}
                        className="w-full border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Desglose de precio */}
        {hasConfig && (
          <div className="mt-6 space-y-1 border-t border-border pt-5">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Precio base</span>
              <span>{fmt(basePrice)}</span>
            </div>
            {selectedVinyl && selectedVinyl.priceModifier > 0 && (
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Vinilo: {selectedVinyl.name}</span>
                <span>+{fmt(selectedVinyl.priceModifier)}</span>
              </div>
            )}
            {extras.map((extra) => {
              if (extra.type === 'checkbox' && checkedExtras.has(extra.id)) {
                return (
                  <div key={extra.id} className="flex justify-between text-xs text-text-secondary">
                    <span>{extra.name}</span><span>+{fmt(extra.price)}</span>
                  </div>
                )
              }
              if (extra.type === 'select') {
                const val = selectValues.get(extra.id)
                if (val) {
                  const opt = extra.options?.find((o) => o.value === val)
                  const total = extra.price + (opt?.priceModifier ?? 0)
                  return (
                    <div key={extra.id} className="flex justify-between text-xs text-text-secondary">
                      <span>{extra.name}: {opt?.label}</span>
                      <span>{total > 0 ? `+${fmt(total)}` : 'Incluido'}</span>
                    </div>
                  )
                }
              }
              if (extra.type === 'text' && textValues.get(extra.id)?.trim() && extra.price > 0) {
                return (
                  <div key={extra.id} className="flex justify-between text-xs text-text-secondary">
                    <span>{extra.name}</span><span>+{fmt(extra.price)}</span>
                  </div>
                )
              }
              return null
            })}
            <div className="flex items-baseline justify-between border-t border-border pt-3 mt-2">
              <span className="text-xs uppercase tracking-widest text-text-muted">Total configurado</span>
              <span className="text-xl font-bold text-gold">{fmt(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className={[
              'w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors',
              added ? 'bg-green-700 text-white' : 'bg-gold text-black hover:bg-gold-light',
            ].join(' ')}
          >
            {added ? '✓ Añadido al carrito' : `${t('addToCart')} ›`}
          </button>
          <button
            type="button"
            onClick={() => { handleAddToCart(); router.push(`/${locale}/checkout`) }}
            className="w-full border border-border py-4 text-sm font-medium uppercase tracking-widest text-text-secondary hover:border-gold hover:text-gold transition-all"
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
