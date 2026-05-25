'use client'

import { useState } from 'react'
import { submitContact } from '@/app/actions/contact'

interface ContactFormProps {
  locale: string
  userEmail: string
  userName: string
}

export function ContactForm({ locale, userEmail, userName }: ContactFormProps) {
  const isEs = locale === 'es'
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await submitContact({ name: userName || userEmail, email: userEmail, message })

    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="border border-border p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
        <div className="flex h-12 w-12 items-center justify-center border border-gold/40">
          <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          {isEs ? 'Mensaje enviado' : 'Message sent'}
        </p>
        <p className="text-sm text-text-secondary max-w-xs">
          {isEs
            ? 'Gracias por escribirnos. Te responderemos en menos de 24h.'
            : "Thanks for reaching out. We'll reply within 24h."}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border p-8">
      <h2 className="text-lg font-semibold text-text-primary">
        {isEs ? 'Envíanos un mensaje' : 'Send us a message'}
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        {isEs
          ? 'Cuéntanos qué modelo te interesa y te respondemos con un presupuesto.'
          : "Tell us which model you're interested in and we'll send you a quote."}
      </p>

      {error && (
        <div className="mt-4 border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Nombre — read-only desde la sesión */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
            {isEs ? 'Nombre' : 'Name'}
          </label>
          <input
            type="text"
            value={userName || userEmail}
            readOnly
            className="w-full border border-border bg-surface/50 px-4 py-3 text-sm text-text-muted cursor-not-allowed"
          />
        </div>
        {/* Email — read-only desde la sesión */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            readOnly
            className="w-full border border-border bg-surface/50 px-4 py-3 text-sm text-text-muted cursor-not-allowed"
          />
        </div>
        {/* Mensaje */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
            {isEs ? 'Mensaje' : 'Message'} *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            minLength={10}
            className="w-full border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors resize-none"
            placeholder={
              isEs
                ? 'Cuéntanos qué modelo te interesa, si quieres extras, y si prefieres envío o recogida en taller...'
                : "Tell us which model you're interested in..."
            }
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-gold bg-gold py-3.5 text-xs font-semibold uppercase tracking-widest text-black hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading
            ? (isEs ? 'Enviando...' : 'Sending...')
            : (isEs ? 'Enviar mensaje' : 'Send message')}
        </button>
      </form>
    </div>
  )
}
