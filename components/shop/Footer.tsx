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

        {/* Social */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <p className="font-pixel text-text-muted shrink-0" style={{ fontSize: '7px', letterSpacing: '0.1em' }}>
            ▸ SÍGUENOS
          </p>
          {/* WhatsApp */}
          <a
            href="https://wa.me/34638962316"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="group flex items-center gap-2 border border-border px-4 py-2 transition-all duration-200 hover:border-gold"
            style={{ boxShadow: '2px 2px 0 0 #1a1a1a' }}
          >
            <svg className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.118 1.529 5.845L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.213-3.726.887.916-3.618-.235-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            <span className="font-pixel text-text-muted group-hover:text-gold transition-colors" style={{ fontSize: '7px', letterSpacing: '0.08em' }}>
              WHATSAPP
            </span>
          </a>
          {/* Instagram */}
          <a
            href="https://instagram.com/simbala.arcade"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="group flex items-center gap-2 border border-border px-4 py-2 transition-all duration-200 hover:border-gold"
            style={{ boxShadow: '2px 2px 0 0 #1a1a1a' }}
          >
            <svg className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="font-pixel text-text-muted group-hover:text-gold transition-colors" style={{ fontSize: '7px', letterSpacing: '0.08em' }}>
              INSTAGRAM
            </span>
          </a>
          {/* TikTok */}
          <a
            href="https://tiktok.com/@simbalavalencia"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="group flex items-center gap-2 border border-border px-4 py-2 transition-all duration-200 hover:border-gold"
            style={{ boxShadow: '2px 2px 0 0 #1a1a1a' }}
          >
            <svg className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
            </svg>
            <span className="font-pixel text-text-muted group-hover:text-gold transition-colors" style={{ fontSize: '7px', letterSpacing: '0.08em' }}>
              TIKTOK
            </span>
          </a>
        </div>

        {/* Bottom */}
        <div className="neon-divider mt-8" />
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
