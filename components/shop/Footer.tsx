import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-gold" viewBox="0 0 32 32" fill="currentColor">
                <path d="M10 5 L22 5 L24.5 9 L24.5 22 L22 25 L10 25 L7.5 22 L7.5 9 Z" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="11" y="9" width="10" height="6" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="14" cy="19.5" r="1.5"/>
                <circle cx="18" cy="19.5" r="1"/>
                <circle cx="20.5" cy="19.5" r="1"/>
                <rect x="11" y="25" width="3" height="2" rx="0.5"/>
                <rect x="18" y="25" width="3" height="2" rx="0.5"/>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-[0.15em] uppercase text-gold">Simbala Arcade</span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-text-muted">Valencia</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Máquinas recreativas artesanales de alta gama. Handcrafted in Spain.
            </p>
          </div>

          {/* Tienda */}
          <nav aria-label="Links del footer">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Tienda</p>
            <ul className="mt-4 space-y-3">
              {[
                { href: `/${locale}/products`, label: t('products') },
                { href: `/${locale}/blog`, label: t('blog') },
                { href: `/${locale}/contact`, label: t('contact') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cuenta */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Cuenta</p>
            <ul className="mt-4 space-y-3">
              {[
                { href: `/${locale}/login`, label: t('login') },
                { href: `/${locale}/register`, label: t('register') },
                { href: `/${locale}/account`, label: t('account') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Simbala Arcade Valencia. Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-muted">Handcrafted in Spain</p>
        </div>
      </div>
    </footer>
  )
}
