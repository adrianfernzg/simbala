'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { requestPasswordReset } from '@/app/actions/reset-password'

export default function ResetPasswordPage() {
  const { locale } = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestPasswordReset({ email, locale })
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setSent(true)
  }

  if (sent) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full border border-border bg-surface p-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-gold/40">
            <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Revisa tu bandeja</p>
          <p className="mt-3 text-sm text-text-secondary">
            Hemos enviado un enlace a <strong className="text-text-primary">{email}</strong> para restablecer tu contraseña. Expira en 1 hora.
          </p>
          <Link
            href={`/${locale}/login`}
            className="mt-8 inline-block border border-border px-8 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted hover:border-gold hover:text-gold transition-all"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full border border-border bg-surface p-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Acceso</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">Restaurar contraseña</h1>
          <p className="mt-3 text-xs text-text-muted">
            Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
              Email
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href={`/${locale}/login`} className="text-gold hover:text-gold-light transition-colors">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </section>
  )
}
