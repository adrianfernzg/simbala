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

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Simbala Arcade</p>
        <h1 className="mt-3 text-4xl font-bold text-text-primary">
          {locale === 'es' ? 'Contacto' : 'Contact'}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {locale === 'es'
            ? 'Para presupuestos, consultas o visitar el taller.'
            : 'For quotes, inquiries or visiting the workshop.'}
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Info de contacto */}
        <div className="space-y-10">
          {[
            {
              label: locale === 'es' ? 'Taller' : 'Workshop',
              value: 'Valencia, España',
              detail: locale === 'es'
                ? 'Visitas con cita previa'
                : 'Visits by appointment only',
            },
            {
              label: 'Email',
              value: 'hola@simbalarcade.com',
              detail: locale === 'es'
                ? 'Respondemos en menos de 24h'
                : 'We reply within 24h',
            },
            {
              label: locale === 'es' ? 'Plazo de fabricación' : 'Lead time',
              value: locale === 'es' ? '8–12 semanas' : '8–12 weeks',
              detail: locale === 'es'
                ? 'Fabricación artesanal bajo pedido'
                : 'Handcrafted to order',
            },
          ].map(({ label, value, detail }) => (
            <div key={label} className="border-l-2 border-gold pl-6">
              <p className="text-[10px] uppercase tracking-widest text-gold">{label}</p>
              <p className="mt-1 text-base font-semibold text-text-primary">{value}</p>
              <p className="mt-0.5 text-xs text-text-muted">{detail}</p>
            </div>
          ))}
        </div>

        {/* Formulario */}
        {user ? (
          <ContactForm locale={locale} userEmail={user.email!} userName={user.name ?? ''} />
        ) : (
          <div className="border border-border p-8 flex flex-col items-center justify-center text-center gap-5 min-h-[300px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
              {isEs ? 'Acceso requerido' : 'Login required'}
            </p>
            <p className="text-sm text-text-secondary max-w-xs">
              {isEs
                ? 'Inicia sesión para enviarnos un mensaje. También puedes escribirnos directamente a'
                : 'Sign in to send us a message. You can also reach us directly at'}{' '}
              <a href="mailto:hola@simbalarcade.com" className="text-gold hover:underline">
                hola@simbalarcade.com
              </a>
            </p>
            <Link
              href={`/${locale}/login?callbackUrl=/${locale}/contact`}
              className="border border-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all"
            >
              {isEs ? 'Iniciar sesión' : 'Sign in'}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
