'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCart } from '@/components/cart/CartProvider'
import { createCheckoutSession } from '@/app/actions/checkout'
import { Input } from '@/components/ui/Input'

type Props = {
  params: Promise<{ locale: string }>
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export default function CheckoutPage({ params }: Props) {
  const { locale } = use(params)
  const t = useTranslations('checkout')
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()

  const [isPickup, setIsPickup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'ES',
  })

  function updateForm(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          extras: item.selectedExtras.map((e) => ({ extraId: e.extraId, value: e.value })),
          quantity: item.quantity,
        })),
        isPickup,
        shippingAddress: isPickup ? undefined : form,
      }

      const result = await createCheckoutSession(payload, locale)
      // Clear cart both in state and directly in localStorage to avoid
      // a race condition where window.location.href navigates before
      // React's useEffect can persist the empty state.
      clearCart()
      try { localStorage.removeItem('simbala_cart') } catch { /* ignore SSR */ }
      window.location.href = result.url
    } catch (err) {
      setLoading(false)
      const message = err instanceof Error ? err.message : 'Error al procesar el pago'
      if (message.startsWith('UNAUTHENTICATED:')) {
        const redirectTo = message.replace('UNAUTHENTICATED:', '')
        router.push(redirectTo)
        return
      }
      setError(message)
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32">
        <p className="text-xs uppercase tracking-widest text-text-muted">Tu carrito está vacío</p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 border border-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all"
        >
          Ver catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Último paso</p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Formulario de envío */}
        <div className="lg:col-span-2 space-y-8">
          {/* Método de entrega */}
          <fieldset>
            <legend className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-4">
              Método de entrega
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={[
                'flex cursor-pointer items-start gap-4 border p-4 transition-all',
                !isPickup ? 'border-gold bg-surface' : 'border-border hover:border-gold/40',
              ].join(' ')}>
                <input
                  type="radio"
                  name="delivery"
                  checked={!isPickup}
                  onChange={() => setIsPickup(false)}
                  className="mt-0.5 accent-[#d4a017]"
                />
                <div>
                  <p className="text-xs font-semibold text-text-primary">Envío a domicilio</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">Toda España. Coordinamos contigo.</p>
                </div>
              </label>
              <label className={[
                'flex cursor-pointer items-start gap-4 border p-4 transition-all',
                isPickup ? 'border-gold bg-surface' : 'border-border hover:border-gold/40',
              ].join(' ')}>
                <input
                  type="radio"
                  name="delivery"
                  checked={isPickup}
                  onChange={() => setIsPickup(true)}
                  className="mt-0.5 accent-[#d4a017]"
                />
                <div>
                  <p className="text-xs font-semibold text-text-primary">{t('pickupInStore')}</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">Taller Valencia. Sin coste.</p>
                </div>
              </label>
            </div>
          </fieldset>

          {/* Datos de envío */}
          {!isPickup && (
            <fieldset>
              <legend className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-4">
                {t('shippingInfo')}
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('name')} *
                  </label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    required={!isPickup}
                    autoComplete="name"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('phone')}
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    autoComplete="tel"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('zip')} *
                  </label>
                  <Input
                    type="text"
                    value={form.zip}
                    onChange={(e) => updateForm('zip', e.target.value)}
                    required={!isPickup}
                    autoComplete="postal-code"
                    placeholder="46000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('address')} *
                  </label>
                  <Input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    required={!isPickup}
                    autoComplete="street-address"
                    placeholder="Calle, número, piso..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('city')} *
                  </label>
                  <Input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    required={!isPickup}
                    autoComplete="address-level2"
                    placeholder="Valencia"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                    {t('country')} *
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => updateForm('country', e.target.value)}
                    required={!isPickup}
                    className="w-full border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-gold focus:outline-none"
                  >
                    <option value="ES">España</option>
                    <option value="PT">Portugal</option>
                    <option value="FR">Francia</option>
                    <option value="DE">Alemania</option>
                    <option value="IT">Italia</option>
                    <option value="GB">Reino Unido</option>
                  </select>
                </div>
              </div>
            </fieldset>
          )}

          {error && (
            <div className="border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Resumen del pedido */}
        <aside className="border border-border bg-surface p-6 h-fit">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-6">Tu pedido</p>

          <ul className="space-y-3 border-b border-border pb-6">
            {items.map((item) => {
              const unitPrice = item.basePrice + item.selectedExtras.reduce((s, e) => s + e.price, 0)
              return (
                <li key={item.id} className="flex justify-between text-xs">
                  <div>
                    <p className="text-text-primary font-medium">{item.productName}</p>
                    {item.selectedExtras.length > 0 && (
                      <p className="mt-0.5 text-[10px] text-text-muted">
                        {item.selectedExtras.map((e) => e.extraName).join(', ')}
                      </p>
                    )}
                    <p className="mt-0.5 text-text-muted">× {item.quantity}</p>
                  </div>
                  <span className="text-text-primary font-medium shrink-0 ml-4">
                    {formatPrice(unitPrice * item.quantity)}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-text-muted">Total</span>
            <span className="text-2xl font-bold text-gold">{formatPrice(totalPrice)}</span>
          </div>

          <p className="mt-1 text-[10px] text-text-muted">IVA incluido</p>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-gold py-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Redirigiendo a Stripe...' : `${t('payWithCard')} ›`}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Pago seguro con Stripe
          </div>
        </aside>
      </form>
    </section>
  )
}
