import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendOrderConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generateOrderRef(): string {
  return 'SA-' + Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

type ExtraSnapshot = {
  extraId: string
  extraName: string
  price: number
  value?: string
}

type CartDataItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  extraSnapshots: ExtraSnapshot[]
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('[webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Sin firma' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  console.log('[webhook] Event received:', event.type, event.id)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      // Log the full error so it appears in Railway logs for debugging
      console.error('[webhook] handleCheckoutCompleted failed:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        userId: session.metadata?.userId,
      })
      // Return 500 so Stripe retries — useful for transient DB errors.
      // If a code bug causes every retry to fail, check Railway logs for
      // the "[webhook] handleCheckoutCompleted failed" message above.
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata
  if (!metadata) throw new Error('Session has no metadata')

  const { userId, cartData, isPickup, shippingAddress } = metadata

  if (!cartData) throw new Error('cartData missing from metadata')

  const cart = JSON.parse(cartData) as CartDataItem[]
  const shipping = JSON.parse(shippingAddress ?? '{}') as {
    name?: string; phone?: string; address?: string
    city?: string; country?: string; zip?: string
  }

  const paymentIntentId = session.payment_intent as string | null
  if (!paymentIntentId) throw new Error('payment_intent is null')

  const payload = await getPayload({ config })

  // Idempotencia — no procesar el mismo pago dos veces
  const existing = await payload.find({
    collection: 'orders',
    where: { stripePaymentId: { equals: paymentIntentId } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    console.log('[webhook] Order already exists for payment intent', paymentIntentId)
    return
  }

  const pickupFlag = isPickup === 'true'
  const customerEmail = session.customer_details?.email ?? ''
  const customerName = session.customer_details?.name ?? shipping.name ?? ''
  const totalAmount = (session.amount_total ?? 0) / 100

  const orderItems = cart.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    basePrice: Number(
      (item.unitPrice - item.extraSnapshots.reduce((s, e) => s + e.price, 0)).toFixed(2)
    ),
    totalPrice: Number((item.unitPrice * item.quantity).toFixed(2)),
    extras: item.extraSnapshots.map((extra) => ({
      extraName: extra.extraName,
      price: extra.price,
      value: extra.value ?? '',
    })),
  }))

  const orderRef = generateOrderRef()
  console.log('[webhook] Creating order for user', userId, 'ref', orderRef, 'total', totalAmount)

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderRef,
      userId,
      stripePaymentId: paymentIntentId,
      status: 'PENDING',
      totalAmount,
      isPickup: pickupFlag,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: shipping.phone ?? '',
      },
      shipping: pickupFlag ? undefined : {
        address: shipping.address ?? '',
        city: shipping.city ?? '',
        zip: shipping.zip ?? '',
        country: shipping.country ?? '',
      },
      items: orderItems,
    },
  })

  console.log('[webhook] Order created:', order.id, 'ref:', orderRef)

  try {
    await sendOrderConfirmation({
      orderId: String(order.id),
      orderRef,
      customerName,
      customerEmail,
      customerPhone: shipping.phone,
      isPickup: pickupFlag,
      totalAmount,
      items: orderItems,
      shipping: pickupFlag ? undefined : {
        address: shipping.address,
        city: shipping.city,
        zip: shipping.zip,
        country: shipping.country,
      },
      createdAt: new Date(),
    })
  } catch (err) {
    // El email falla en silencio — el pedido ya está creado
    console.error('[webhook] Email confirmation failed (order already saved):', err)
  }
}
