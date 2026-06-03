'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { requestPasswordReset, confirmPasswordReset } from '@/app/actions/reset-password'

type Step = 'email' | 'code' | 'done'

export default function ResetPasswordPage() {
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === 'code') {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setCode(text.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestPasswordReset({ email })
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setStep('code')
  }

  async function handleResend() {
    setResendSent(false)
    setError('')
    setResendLoading(true)
    const result = await requestPasswordReset({ email })
    setResendLoading(false)
    if ('error' in result) { setError(result.error); return }
    setResendSent(true)
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Introduce los 6 dígitos del código.'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    setError('')
    setLoading(true)
    const result = await confirmPasswordReset({ email, code: fullCode, password })
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full border border-border bg-surface p-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-gold/40">
            <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Listo</p>
          <p className="mt-3 text-sm text-text-secondary">
            Tu contraseña ha sido actualizada correctamente.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/login`)}
            className="mt-8 w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    )
  }

  if (step === 'code') {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full border border-border bg-surface p-10">
          <div className="mb-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Verificación</p>
            <h1 className="mt-3 text-2xl font-bold text-text-primary">Nueva contraseña</h1>
            <p className="mt-3 text-xs text-text-muted">
              Hemos enviado un código de 6 dígitos a{' '}
              <span className="text-text-primary font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}
          {resendSent && (
            <div className="mb-6 border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-gold">
              Código reenviado. Comprueba tu bandeja de entrada.
            </div>
          )}

          <form onSubmit={handleConfirm} className="space-y-6">
            {/* Code input */}
            <div>
              <label className="mb-3 block text-[10px] uppercase tracking-widest text-text-muted">
                Código de verificación
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 border border-border bg-surface text-center text-xl font-bold text-text-primary focus:border-gold focus:outline-none transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* New password */}
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
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-text-muted">
                Confirmar contraseña
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              ¿No has recibido el código?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-gold hover:text-gold-light transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Enviando...' : 'Reenviar'}
              </button>
            </p>
          </div>
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
            Introduce tu email y te enviaremos un código para crear una nueva contraseña.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRequestCode} className="space-y-5">
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
            {loading ? 'Enviando...' : 'Enviar código'}
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
