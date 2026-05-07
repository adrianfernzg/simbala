import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  )
}
