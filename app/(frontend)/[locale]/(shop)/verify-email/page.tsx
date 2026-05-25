'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { verifyEmailCode, resendVerificationCode } from '@/app/actions/verify-email'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useParams<{ locale: string }>()
  const email = searchParams.get('email') ?? ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Introduce los 6 dígitos del código.'); return }
    setError('')
    setLoading(true)

    const result = await verifyEmailCode({ email, code: fullCode })
    setLoading(false)

    if ('error' in result) { setError(result.error); return }

    router.push(`/${locale}/login?verified=1`)
  }

  async function handleResend() {
    setResendSent(false)
    setError('')
    setResendLoading(true)
    const result = await resendVerificationCode({ email })
    setResendLoading(false)
    if ('error' in result) { setError(result.error); return }
    setResendSent(true)
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full border border-border bg-surface p-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Verificación</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">Verifica tu cuenta</h1>
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

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            ¿No has recibido el código?{' '}
            <button
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
