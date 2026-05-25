import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

type OrderItem = {
  productName: string
  quantity: number
  basePrice: number
  totalPrice: number
  extras: Array<{ extraName: string; price: number; value?: string }>
}

type OrderEmailData = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  isPickup: boolean
  totalAmount: number
  items: OrderItem[]
  shipping?: {
    address?: string
    city?: string
    zip?: string
    country?: string
  }
  createdAt?: Date
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

function buildInvoiceHtml(order: OrderEmailData): string {
  const ref = order.orderId.slice(-8).toUpperCase()
  const date = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(order.createdAt ?? new Date())

  const itemsHtml = order.items.map((item) => {
    const extrasHtml = item.extras.length > 0
      ? `<tr><td colspan="4" style="padding:0 16px 10px 16px;">
           <div style="font-size:11px;color:#999;line-height:1.6;">
             ${item.extras.map(e => `${e.extraName}${e.value ? `: ${e.value}` : ''} <span style="color:#C9A84C;">(+${fmt(e.price)})</span>`).join(' &nbsp;·&nbsp; ')}
           </div>
         </td></tr>`
      : ''
    return `
      <tr>
        <td style="padding:14px 16px 4px 16px;font-size:13px;color:#1a1a1a;font-weight:600;">${item.productName}</td>
        <td style="padding:14px 16px 4px 16px;font-size:13px;color:#555;text-align:center;">×${item.quantity}</td>
        <td style="padding:14px 16px 4px 16px;font-size:13px;color:#555;text-align:right;">${fmt(item.basePrice)}</td>
        <td style="padding:14px 16px 4px 16px;font-size:13px;color:#1a1a1a;font-weight:600;text-align:right;">${fmt(item.totalPrice)}</td>
      </tr>
      ${extrasHtml}
    `
  }).join('')

  const shippingHtml = order.isPickup
    ? `<p style="margin:0;font-size:13px;color:#555;">Recogida en taller · Valencia</p>`
    : `<p style="margin:0;font-size:13px;color:#555;">
        ${order.shipping?.address ?? ''}, ${order.shipping?.zip ?? ''} ${order.shipping?.city ?? ''}, ${order.shipping?.country ?? ''}
       </p>`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">
      <tr>
        <td style="background:#0d0d0d;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#C9A84C;">Simbala Arcade</p>
          <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Pedido confirmado</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#888;">Referencia: <strong style="color:#C9A84C;">#${ref}</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px 0;border-bottom:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:13px;color:#555;">Hola <strong style="color:#1a1a1a;">${order.customerName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.6;">
            Hemos recibido tu pedido correctamente. A continuación tienes el resumen.
            Nos pondremos en contacto contigo en las próximas horas para coordinar los detalles.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px 0;">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#999;">Productos</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;">
            <tr style="background:#f9f9f9;">
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;color:#999;text-align:left;font-weight:500;">Producto</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;color:#999;text-align:center;font-weight:500;">Cant.</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;color:#999;text-align:right;font-weight:500;">Precio</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;color:#999;text-align:right;font-weight:500;">Total</th>
            </tr>
            ${itemsHtml}
            <tr style="border-top:2px solid #eee;background:#fafafa;">
              <td colspan="3" style="padding:14px 16px;font-size:12px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.1em;">Total</td>
              <td style="padding:14px 16px;font-size:16px;font-weight:700;color:#C9A84C;text-align:right;">${fmt(order.totalAmount)}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px 0;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#999;">${order.isPickup ? 'Recogida' : 'Envío'}</p>
          ${shippingHtml}
          ${order.customerPhone ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">Tel: ${order.customerPhone}</p>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px 0;">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#999;">Próximos pasos</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            ${[
              'Revisaremos tu pedido y te contactaremos en las próximas horas',
              'El plazo habitual de fabricación es de 8–12 semanas',
              'Puedes consultar el estado en cualquier momento desde tu cuenta',
            ].map((step, i) => `
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:20px;font-size:11px;color:#C9A84C;font-weight:700;">0${i + 1}</span>
                  <span style="font-size:12px;color:#555;">${step}</span>
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px;border-top:1px solid #eee;text-align:center;margin-top:24px;">
          <p style="margin:0;font-size:11px;color:#bbb;">
            Este documento es una <strong style="color:#999;">factura proforma</strong> y no tiene validez fiscal.
          </p>
          <p style="margin:8px 0 0;font-size:10px;color:#ccc;">Simbala Arcade · Valencia, España · ${date}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function sendContactEmail(data: {
  name: string
  email: string
  message: string
}): Promise<void> {
  const notificationAddress = process.env.CONTACT_EMAIL ?? 'simbala.desarrollo@gmail.com'
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#C9A84C;">Nuevo mensaje de contacto — Simbala Arcade</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <hr style="border:1px solid #eee;margin:16px 0;" />
      <p style="white-space:pre-wrap;">${data.message}</p>
    </div>
  `

  if (!resend) {
    console.log(`\n📧 [CONTACTO sin Resend] De: ${data.name} <${data.email}>\n${data.message}\n`)
    return
  }

  // replyTo = email del cliente → el propietario responde directamente al cliente
  // El cliente nunca ve la dirección real del propietario porque el From siempre
  // sale de EMAIL_FROM (hola@simbalarcade.com o similar).
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Simbala Arcade <hola@simbalarcade.com>',
    to: notificationAddress,
    replyTo: data.email,
    subject: `Mensaje de ${data.name} — Simbala Arcade`,
    html,
  })
}

export async function sendOrderConfirmation(order: OrderEmailData): Promise<void> {
  const ref = order.orderId.slice(-8).toUpperCase()
  const subject = `Pedido confirmado #${ref} — Simbala Arcade`
  const html = buildInvoiceHtml(order)

  if (!resend) {
    console.log(`\n📧 [EMAIL sin configurar] Para: ${order.customerEmail} | Asunto: ${subject}\n`)
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Simbala Arcade <noreply@simbala.es>',
    to: order.customerEmail,
    subject,
    html,
  })
}
