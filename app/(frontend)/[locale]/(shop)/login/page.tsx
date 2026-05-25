'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { checkLoginStatus } from '@/app/actions/check-login-status'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useParams<{ locale: string }>()
  const callbackUrl = searchParams.get('callbackUrl') ?? `/${locale}`
  const justVerified = searchParams.get('verified') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ text: string; action?: { label: string; href: string }; showForgot?: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!result?.error) {
      router.push(callbackUrl)
      router.refresh()
      return
    }

    const status = await checkLoginStatus(email)
    setLoading(false)

    if (status === 'not_found') {
      setError({ text: 'No existe ninguna cuenta con ese email.' })
    } else if (status === 'not_verified') {
      setError({
        text: 'Cuenta pendiente de verificación. Revisa tu bandeja de entrada.',
        action: { label: 'Reenviar código', href: `/${locale}/verify-email?email=${encodeURIComponent(email)}` },
      })
    } else if (status === 'google_only') {
      setError({ text: 'Esta cuenta se creó con Google. Usa el botón de Google para acceder.' })
    } else {
      setError({ text: 'Contraseña incorrecta.', showForgot: true })
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full border border-border bg-surface p-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Bienvenido</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">{t('login')}</h1>
        </div>

        {justVerified && (
          <div className="mb-6 border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-gold">
            Cuenta verificada correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        {error && (
          <div className="mb-6 border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            <span>{error.text}</span>
            {error.action && (
              <Link
                href={error.action.href}
                className="ml-2 underline hover:text-red-300 transition-colors"
              >
                {error.action.label}
              </Link>
            )}
            {error.showForgot && (
              <Link
                href={`/${locale}/reset-password?email=${encodeURIComponent(email)}`}
                className="ml-2 underline hover:text-red-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
              {t('email')}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
              {t('password')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Cargando...' : t('login')}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-muted">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
          className="mt-4 w-full flex items-center justify-center gap-3 border border-border py-3 text-xs font-semibold uppercase tracking-widest text-text-muted hover:border-gold hover:text-text-primary transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('continueWithGoogle')}
        </button>

        <p className="mt-6 text-center text-xs text-text-muted">
          {t('dontHaveAccount')}{' '}
          <Link
            href={`/${locale}/register`}
            className="text-gold hover:text-gold-light transition-colors"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </section>
  )
}
