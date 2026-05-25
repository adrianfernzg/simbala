'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useParams<{ locale: string }>()
  const callbackUrl = searchParams.get('callbackUrl') ?? `/${locale}`
  const justVerified = searchParams.get('verified') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña incorrectos. Si acabas de registrarte, verifica tu cuenta primero.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full border border-border bg-surface p-10">
        {/* Header */}
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
            {error}
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
