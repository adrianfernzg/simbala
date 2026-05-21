import type { Metadata } from 'next'

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
        <div className="border border-border p-8">
          <h2 className="text-lg font-semibold text-text-primary">
            {locale === 'es' ? 'Envíanos un mensaje' : 'Send us a message'}
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {locale === 'es'
              ? 'Cuéntanos qué modelo te interesa y te respondemos con un presupuesto.'
              : 'Tell us which model you\'re interested in and we\'ll send you a quote.'}
          </p>

          <form
            action={`mailto:hola@simbalarcade.com`}
            method="get"
            className="mt-8 space-y-5"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
                {locale === 'es' ? 'Nombre' : 'Name'}
              </label>
              <input
                type="text"
                name="nombre"
                required
                className="w-full border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
                placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
                placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
                {locale === 'es' ? 'Mensaje' : 'Message'}
              </label>
              <textarea
                name="body"
                rows={5}
                required
                className="w-full border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors resize-none"
                placeholder={
                  locale === 'es'
                    ? 'Cuéntanos qué modelo te interesa, si quieres extras, y si prefieres envío o recogida en taller...'
                    : 'Tell us which model you\'re interested in...'
                }
              />
            </div>
            <button
              type="submit"
              className="w-full border border-gold bg-gold py-3.5 text-xs font-semibold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
            >
              {locale === 'es' ? 'Enviar mensaje' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
