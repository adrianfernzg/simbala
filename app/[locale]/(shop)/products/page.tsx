import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'navigation' })

  const products = await db.product.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main>
      <h1>{t('products')}</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </main>
  )
}
