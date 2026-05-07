'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('navigation')
  const pathname = usePathname()

  const navLinks = [
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          {/* Icono arcade */}
          <svg className="h-7 w-7 text-gold" viewBox="0 0 32 32" fill="currentColor">
            <path d="M10 5 L22 5 L24.5 9 L24.5 22 L22 25 L10 25 L7.5 22 L7.5 9 Z" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="9" width="10" height="6" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="14" cy="19.5" r="1.5"/>
            <circle cx="18" cy="19.5" r="1"/>
            <circle cx="20.5" cy="19.5" r="1"/>
            <rect x="11" y="25" width="3" height="2" rx="0.5"/>
            <rect x="18" y="25" width="3" height="2" rx="0.5"/>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-gold group-hover:text-gold-light transition-colors">
              Simbala Arcade
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-text-muted">Valencia</span>
          </div>
        </Link>

        {/* Nav central */}
        <nav aria-label="Navegación principal">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      'text-xs font-medium tracking-widest uppercase transition-colors relative py-1',
                      'after:absolute after:bottom-0 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-200',
                      isActive
                        ? 'text-gold after:w-full'
                        : 'text-text-secondary hover:text-text-primary after:w-0 hover:after:w-full',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          <Link
            href={`/${locale}/cart`}
            aria-label={t('cart')}
            className="relative p-2.5 text-text-secondary hover:text-gold transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </Link>

          <Link
            href={`/${locale}/account`}
            aria-label={t('account')}
            className="p-2.5 text-text-secondary hover:text-gold transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          <Link
            href={`/${locale}/login`}
            className="ml-2 border border-gold px-4 py-2 text-xs font-medium tracking-widest uppercase text-gold hover:bg-gold hover:text-black transition-all duration-200"
          >
            {t('login')}
          </Link>
        </div>
      </div>
    </header>
  )
}
