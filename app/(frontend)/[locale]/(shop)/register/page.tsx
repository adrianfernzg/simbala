'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = e.currentTarget
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value
    if (honeypot) return

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    })

    if (!res.ok) {
      const data = await res.json()
      setLoading(false)
      setError(data.error?.formErrors?.[0] ?? data.error ?? 'Error al registrarse')
      return
    }

    // Auto-login after register
    await signIn('credentials', { email, password, redirect: false })
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full border border-border bg-surface p-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Únete</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">{t('register')}</h1>
        </div>

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
              {t('name')}
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Tu nombre"
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres, una mayúscula y un número"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
              {t('confirmPassword')}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repite la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : t('register')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-gold hover:text-gold-light transition-colors"
          >
            {t('login')}
          </Link>
        </p>
      </div>
    </section>
  )
}
