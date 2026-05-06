import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Recreativas — Máquinas Recreativas',
    template: '%s | Recreativas',
  },
  description: 'Venta de máquinas recreativas. Envío a toda España o recogida en taller.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  )
}
