import { Header } from '@/components/shop/Header'
import { Footer } from '@/components/shop/Footer'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ShopLayout({ children, params }: Props) {
  const { locale } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  )
}
