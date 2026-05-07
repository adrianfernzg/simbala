import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-base font-bold text-zinc-900">Recreativas</p>
            <p className="mt-2 text-sm text-zinc-500">
              Máquinas recreativas de calidad. Envío a toda España o recogida en taller.
            </p>
          </div>

          <nav aria-label="Links del footer">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Tienda</p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href={`/${locale}/products`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Cuenta</p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href={`/${locale}/login`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/register`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('register')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account`} className="text-sm text-zinc-600 hover:text-zinc-900">
                  {t('account')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Recreativas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
