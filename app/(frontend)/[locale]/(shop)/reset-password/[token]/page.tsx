'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { confirmPasswordReset } from '@/app/actions/reset-password'
import { signIn } from 'next-auth/react'

export default function ResetPasswordTokenPage() {
  const { locale, token } = useParams<{ locale: string; token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const result = await confirmPasswordReset({ token, password })
    setLoading(false)

    if ('error' in result) { setError(result.error); return }
    setDone(true)
  }

  if (done) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full border border-border bg-surface p-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-gold/40">
            <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Contraseña actualizada</p>
          <p className="mt-3 text-sm text-text-secondary">
            Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión.
          </p>
          <Link
            href={`/${locale}/login`}
            className="mt-8 inline-block border border-border px-8 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted hover:border-gold hover:text-gold transition-all"
          >
            Iniciar sesión
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
          <h1 className="mt-3 text-2xl font-bold text-text-primary">Nueva contraseña</h1>
          <p className="mt-3 text-xs text-text-muted">
            Introduce tu nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula y un número.
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
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
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
