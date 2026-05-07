import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import type Stripe from 'stripe'

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
  const cart = JSON.parse(cartData) as Array<{
    productId: string
    extraIds: string[]
    quantity: number
    unitPrice: number
  }>
  const shipping = JSON.parse(shippingAddress) as {
    name?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    zip?: string
  }

  const existingOrder = await db.order.findUnique({
    where: { stripePaymentId: session.payment_intent as string },
  })
  if (existingOrder) return

  await db.order.create({
    data: {
      userId,
      stripePaymentId: session.payment_intent as string,
      status: 'PENDING',
      totalAmount: (session.amount_total! / 100).toFixed(2),
      shippingName: session.customer_details?.name ?? shipping.name ?? '',
      shippingEmail: session.customer_details?.email ?? '',
      shippingPhone: shipping.phone,
      isPickup: isPickup === 'true',
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingCountry: shipping.country,
      shippingZip: shipping.zip,
      items: {
        create: await Promise.all(
          cart.map(async (item) => {
            const product = await db.product.findUnique({
              where: { id: item.productId },
              include: { extras: { where: { id: { in: item.extraIds } } } },
            })
            return {
              productId: item.productId,
              productName: product!.name,
              quantity: item.quantity,
              basePrice: product!.basePrice,
              totalPrice: (item.unitPrice * item.quantity).toFixed(2),
              extras: {
                create: product!.extras.map((extra) => ({
                  extraId: extra.id,
                  extraName: extra.name,
                  price: extra.price,
                })),
              },
            }
          })
        ),
      },
    },
  })
}
