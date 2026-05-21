import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendOrderConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

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
    return NextResponse.json({ error: 'Sin firma' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await handleCheckoutCompleted(session)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, cartData, isPickup, shippingAddress } = session.metadata!
  const cart = JSON.parse(cartData) as CartDataItem[]
  const shipping = JSON.parse(shippingAddress) as {
    name?: string; phone?: string; address?: string
    city?: string; country?: string; zip?: string
  }

  const payload = await getPayload({ config })

  // Idempotencia — no procesar el mismo pago dos veces
  const existing = await payload.find({
    collection: 'orders',
    where: { stripePaymentId: { equals: session.payment_intent as string } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return

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

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      userId,
      stripePaymentId: session.payment_intent as string,
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

  // Enviar email de confirmación con factura proforma
  try {
    await sendOrderConfirmation({
      orderId: String(order.id),
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
    // No fallar el webhook si el email falla
    console.error('Error enviando email de confirmación:', err)
  }
}
