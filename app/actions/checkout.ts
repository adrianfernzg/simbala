'use server'

import { auth } from '@/lib/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { stripe } from '@/lib/stripe'
import { checkoutSchema } from '@/lib/validations/checkout'

type ResolvedExtra = {
  extraId: string
  extraName: string
  price: number
  value?: string
}

type CheckoutResult =
  | { url: string }
  | { error: string; redirectTo?: string }

export async function createCheckoutSession(
  data: unknown,
  locale: string = 'es'
): Promise<CheckoutResult> {
  try {
    // Auth
    let session
    try {
      session = await auth()
    } catch (err) {
      console.error('[checkout] auth() error:', err)
      return { error: 'Error de autenticación. Recarga la página e inténtalo de nuevo.' }
    }

    if (!session?.user?.id) {
      return { error: 'Sesión caducada', redirectTo: `/${locale}/login` }
    }

    // Validación
    const parsed = checkoutSchema.safeParse(data)
    if (!parsed.success) {
      console.error('[checkout] Zod validation error:', parsed.error.flatten())
      return { error: 'Datos de checkout inválidos' }
    }

    const { items, isPickup, shippingAddress } = parsed.data

    // Payload
    let payload
    try {
      payload = await getPayload({ config })
    } catch (err) {
      console.error('[checkout] getPayload() error:', err)
      return { error: 'Error interno del servidor. Inténtalo de nuevo.' }
    }

    // Verificar y calcular precios en el servidor — nunca confiar en precios del cliente
    const cartItems = await Promise.all(
      items.map(async (item) => {
        const product = await payload.findByID({
          collection: 'products',
          id: item.productId,
          depth: 1,
        })

        if (!product || !product.published) {
          throw new Error(`Producto no encontrado: ${item.productId}`)
        }

        type PayloadExtra = { id: string; name: string; price: number; type: string; options?: Array<{ id: string; label: string; value: string; priceModifier: number }> }
        type PayloadVinyl = { id: string; name: string; priceModifier: number }

        const productExtras = (product.extras ?? []) as PayloadExtra[]
        const productVinyls = (product.vinyls ?? []) as PayloadVinyl[]

        const resolvedExtras: ResolvedExtra[] = []
        let extrasTotal = 0

        for (const selected of item.extras) {
          if (selected.extraId.startsWith('vinyl_')) {
            const vinylId = selected.extraId.replace('vinyl_', '')
            const vinyl = productVinyls.find((v) => String(v.id) === vinylId)
            if (!vinyl) throw new Error(`Vinilo no encontrado: ${vinylId}`)
            const price = Number(vinyl.priceModifier ?? 0)
            resolvedExtras.push({ extraId: selected.extraId, extraName: `Vinilo: ${vinyl.name}`, price, value: vinylId })
            extrasTotal += price
            continue
          }

          const extra = productExtras.find((e) => String(e.id) === selected.extraId)
          if (!extra) throw new Error(`Extra no encontrado: ${selected.extraId}`)

          if (extra.type === 'select') {
            const option = (extra.options ?? []).find((o) => o.value === selected.value)
            if (!option) throw new Error(`Opción no encontrada: ${selected.value}`)
            const price = Number(extra.price) + Number(option.priceModifier ?? 0)
            resolvedExtras.push({
              extraId: extra.id,
              extraName: `${extra.name as string}: ${option.label}`,
              price,
              value: option.value,
            })
            extrasTotal += price
          } else {
            const price = Number(extra.price)
            resolvedExtras.push({
              extraId: extra.id,
              extraName: extra.name as string,
              price,
              value: selected.value,
            })
            extrasTotal += price
          }
        }

        const unitPrice = Number(product.basePrice) + extrasTotal

        const images = (product.images ?? []) as Array<{ image: { url?: string } | string }>
        const firstImageRaw = images[0]?.image
        const rawUrl = typeof firstImageRaw === 'object' ? firstImageRaw?.url : undefined
        const firstImageUrl = rawUrl?.startsWith('https://') ? rawUrl : undefined

        return { product, resolvedExtras, quantity: item.quantity, unitPrice, firstImageUrl }
      })
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    console.log('[checkout] Creating Stripe session for user:', session.user.id)

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email!,
      line_items: cartItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(item.unitPrice * 100),
          product_data: {
            name: item.product.name as string,
            ...(item.firstImageUrl ? { images: [item.firstImageUrl] } : {}),
            description: item.resolvedExtras.map((e) => e.extraName).join(', ') || undefined,
          },
        },
      })),
      metadata: {
        userId: session.user.id,
        cartData: JSON.stringify(
          items.map((item, i) => ({
            productId: item.productId,
            productName: cartItems[i].product.name as string,
            quantity: item.quantity,
            unitPrice: cartItems[i].unitPrice,
            extraSnapshots: cartItems[i].resolvedExtras,
          }))
        ),
        isPickup: String(isPickup),
        shippingAddress: JSON.stringify(shippingAddress ?? {}),
      },
      success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${locale}/cart`,
    })

    if (!checkoutSession.url) return { error: 'No se pudo crear la sesión de pago' }

    return { url: checkoutSession.url }
  } catch (err) {
    console.error('[checkout] unexpected error:', err)
    return { error: err instanceof Error ? err.message : 'Error al procesar el pago' }
  }
}
