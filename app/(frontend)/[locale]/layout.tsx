import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '../../globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Simbala Arcade — Máquinas Recreativas Premium · Valencia',
    template: '%s | Simbala Arcade',
  },
  description:
    'Máquinas recreativas artesanales de alta gama. Fabricadas en Valencia. Envío a toda España o recogida en taller.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Simbala Arcade',
    locale: 'es_ES',
    type: 'website',
  },
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
