'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { CartBadge } from '@/components/shop/CartBadge'

interface HeaderProps {
  locale: string
  userName?: string | null
}

export function Header({ locale, userName }: HeaderProps) {
  const t = useTranslations('navigation')
  const pathname = usePathname()

  const navLinks = [
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md"
      style={{ borderBottom: '2px solid #2a2a2a', boxShadow: '0 2px 0 0 #1a1a1a, 0 0 20px rgba(212,160,23,0.06)' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <svg className="h-8 w-8 text-gold crt-flicker" viewBox="0 0 32 32" fill="currentColor">
            <path d="M10 5 L22 5 L24.5 9 L24.5 22 L22 25 L10 25 L7.5 22 L7.5 9 Z" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="9" width="10" height="6" rx="0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="14" cy="19.5" r="1.5"/>
            <circle cx="18" cy="19.5" r="1.2"/>
            <circle cx="21" cy="19.5" r="1.2"/>
            <rect x="11" y="25" width="3" height="2"/>
            <rect x="18" y="25" width="3" height="2"/>
          </svg>
          <div className="flex flex-col leading-none gap-0.5">
            <span
              className="font-pixel text-gold group-hover:text-gold-light transition-colors glow-gold"
              style={{ fontSize: '9px', letterSpacing: '0.05em' }}
            >
              SIMBALA
            </span>
            <span
              className="font-pixel text-gold-muted"
              style={{ fontSize: '6px', letterSpacing: '0.15em' }}
            >
              ARCADE · VLC
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav aria-label="Navegación principal">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      'relative text-base font-semibold tracking-[0.15em] uppercase transition-all duration-150 py-1 px-0.5',
                      isActive
                        ? 'text-gold glow-gold'
                        : 'text-text-secondary hover:text-gold',
                    ].join(' ')}
                    style={isActive ? {} : {}}
                  >
                    {isActive && (
                      <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-gold text-xs">▶</span>
                    )}
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          <CartBadge locale={locale} label={t('cart')} />

          <Link
            href={`/${locale}/account`}
            aria-label={t('account')}
            className="p-2.5 text-text-secondary hover:text-gold transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          {userName ? (
            <span className="ml-2 hidden text-[10px] tracking-widest text-gold font-pixel sm:block" style={{ fontSize: '8px' }}>
              {userName.split(' ')[0].toUpperCase()}
            </span>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="ml-2 px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-gold transition-all duration-150 pixel-box-gold hover:bg-gold hover:text-black"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
