import { Header } from '@/components/shop/Header'
import { Footer } from '@/components/shop/Footer'
import { CartProvider } from '@/components/cart/CartProvider'
import { auth } from '@/lib/auth'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ShopLayout({ children, params }: Props) {
  const { locale } = await params
  let session = null
  try {
    session = await auth()
  } catch (err) {
    console.error('[ShopLayout] auth() error:', err)
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} userName={session?.user?.name} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
    </CartProvider>
  )
}
