import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <footer className="bg-surface" style={{ borderTop: '2px solid var(--color-gold)', boxShadow: '0 -1px 10px rgba(212,160,23,0.5), 0 -1px 28px rgba(212,160,23,0.2)' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg className="h-8 w-8 text-gold crt-flicker" viewBox="0 0 32 32" fill="currentColor">
                <path d="M10 5 L22 5 L24.5 9 L24.5 22 L22 25 L10 25 L7.5 22 L7.5 9 Z" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="11" y="9" width="10" height="6" rx="0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="14" cy="19.5" r="1.5"/>
                <circle cx="18" cy="19.5" r="1.2"/>
                <circle cx="21" cy="19.5" r="1.2"/>
                <rect x="11" y="25" width="3" height="2"/>
                <rect x="18" y="25" width="3" height="2"/>
              </svg>
              <div className="flex flex-col leading-none gap-1">
                <span className="font-pixel text-gold glow-gold" style={{ fontSize: '9px' }}>SIMBALA</span>
                <span className="font-pixel text-gold-muted" style={{ fontSize: '6px', letterSpacing: '0.15em' }}>ARCADE · VLC</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Máquinas recreativas artesanales de alta gama.{' '}
              <span className="text-gold">Handcrafted in Spain.</span>
            </p>
          </div>

          {/* Tienda */}
          <nav aria-label="Links del footer">
            <p className="font-pixel text-gold mb-4" style={{ fontSize: '8px', letterSpacing: '0.1em' }}>▸ TIENDA</p>
            <ul className="space-y-3">
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
            <p className="font-pixel text-gold mb-4" style={{ fontSize: '8px', letterSpacing: '0.1em' }}>▸ CUENTA</p>
            <ul className="space-y-3">
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

        {/* Bottom */}
        <div className="neon-divider mt-12" />
        <div className="pt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Simbala Arcade Valencia. Todos los derechos reservados.
          </p>
          <p className="font-pixel text-text-muted" style={{ fontSize: '7px', letterSpacing: '0.1em' }}>
            HANDCRAFTED IN SPAIN 🕹️
          </p>
        </div>
      </div>
    </footer>
  )
}
