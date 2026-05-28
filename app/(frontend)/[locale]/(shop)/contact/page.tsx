import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ContactForm } from '@/components/shop/ContactForm'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Contacto' : 'Contact',
    description: locale === 'es'
      ? 'Contacta con Simbala Arcade. Taller en Valencia. Presupuestos y consultas.'
      : 'Contact Simbala Arcade. Workshop in Valencia. Quotes and inquiries.',
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const isEs = locale === 'es'

  let session = null
  try { session = await auth() } catch { /* ignorar */ }
  const user = session?.user ?? null

  const stats = [
    { label: isEs ? 'Ubicación' : 'Location',   value: 'VLC',      sub: isEs ? 'Valencia, España' : 'Valencia, Spain' },
    { label: isEs ? 'Plazo'     : 'Lead time',   value: '8–12',     sub: isEs ? 'semanas de fab.' : 'weeks to build' },
    { label: isEs ? 'Pago'      : 'Payment',     value: '100%',     sub: isEs ? 'seguro · Stripe' : 'secure · Stripe' },
    { label: isEs ? 'Visitas'   : 'Visits',      value: 'CITA',     sub: isEs ? 'previa requerida' : 'by appointment' },
  ]

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-0 sm:px-6 lg:px-8">
        <div className="relative pb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Simbala Arcade</p>
          <h1 className="mt-3 font-arcade text-4xl uppercase text-text-primary">
            {isEs ? 'Contacto' : 'Contact'}
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-lg">
            {isEs
              ? 'Para presupuestos, consultas o visitar el taller.'
              : 'For quotes, inquiries or visiting the workshop.'}
          </p>
        </div>
        <div className="neon-divider" />
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4 bg-gold/20">
          {stats.map(({ label, value, sub }) => (
            <div key={label} className="bg-surface flex flex-col items-center justify-center px-6 py-6 text-center gap-1 pixel-corners">
              <p className="font-pixel text-gold-muted" style={{ fontSize: '7px', letterSpacing: '0.15em' }}>
                {label.toUpperCase()}
              </p>
              <p className="font-arcade text-3xl text-gold glow-gold mt-1 leading-none">{value}</p>
              <p className="text-xs text-text-muted mt-1 leading-tight">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

          {/* Info de contacto */}
          <div className="space-y-10">
            <p className="font-pixel text-gold" style={{ fontSize: '8px', letterSpacing: '0.15em' }}>
              ▸ {isEs ? 'INFORMACIÓN' : 'INFORMATION'}
            </p>

            {[
              {
                label: isEs ? 'Taller' : 'Workshop',
                value: 'Valencia, España',
                detail: isEs ? 'Visitas con cita previa' : 'Visits by appointment only',
              },
              {
                label: isEs ? 'Plazo de fabricación' : 'Lead time',
                value: isEs ? '8–12 semanas' : '8–12 weeks',
                detail: isEs ? 'Fabricación artesanal bajo pedido' : 'Handcrafted to order',
              },
              {
                label: isEs ? 'Pago' : 'Payment',
                value: isEs ? 'Stripe — 100% seguro' : 'Stripe — 100% secure',
                detail: isEs ? 'Tarjeta de crédito o débito' : 'Credit or debit card',
              },
            ].map(({ label, value, detail }) => (
              <div key={label} className="neon-accent-l">
                <p className="font-pixel text-gold" style={{ fontSize: '7px', letterSpacing: '0.12em' }}>
                  {label.toUpperCase()}
                </p>
                <p className="mt-2 text-base font-semibold text-text-primary">{value}</p>
                <p className="mt-0.5 text-xs text-text-muted">{detail}</p>
              </div>
            ))}

            {/* CTA catálogo */}
            <div className="pt-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-3 pixel-box-gold px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all duration-200"
              >
                ▶ {isEs ? 'Ver catálogo' : 'View catalogue'}
              </Link>
            </div>
          </div>

          {/* Formulario */}
          <div>
            <p className="font-pixel text-gold mb-6" style={{ fontSize: '8px', letterSpacing: '0.15em' }}>
              ▸ {isEs ? 'ENVIAR MENSAJE' : 'SEND MESSAGE'}
            </p>
            {user ? (
              <ContactForm locale={locale} userEmail={user.email!} userName={user.name ?? ''} />
            ) : (
              <div className="pixel-box py-16 flex flex-col items-center justify-center text-center gap-5 min-h-[300px]">
                <svg className="h-12 w-12 text-gold opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <div>
                  <p className="font-pixel text-text-muted mb-2" style={{ fontSize: '7px', letterSpacing: '0.2em' }}>
                    {isEs ? 'ACCESO REQUERIDO' : 'LOGIN REQUIRED'}
                  </p>
                  <p className="text-sm text-text-secondary max-w-xs">
                    {isEs
                      ? 'Inicia sesión para enviarnos un mensaje.'
                      : 'Sign in to send us a message.'}
                  </p>
                </div>
                <Link
                  href={`/${locale}/login?callbackUrl=/${locale}/contact`}
                  className="pixel-box-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all"
                >
                  {isEs ? '▶ Iniciar sesión' : '▶ Sign in'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
