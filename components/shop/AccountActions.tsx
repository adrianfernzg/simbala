'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { deleteAccount } from '@/app/actions/delete-account'

const CART_STORAGE_KEY = 'simbala_cart'

interface Props {
  locale: string
}

export function AccountActions({ locale }: Props) {
  const [showLogout, setShowLogout] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleLogout() {
    localStorage.removeItem(CART_STORAGE_KEY)
    await signOut({ callbackUrl: `/${locale}` })
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    const result = await deleteAccount()
    if ('error' in result) {
      setDeleting(false)
      setDeleteError(result.error)
      return
    }
    localStorage.removeItem(CART_STORAGE_KEY)
    await signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="text-xs uppercase tracking-widest text-text-muted hover:text-red-400 transition-colors"
        >
          Cerrar sesión
        </button>
        <span className="text-border" aria-hidden="true">|</span>
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="text-xs uppercase tracking-widest text-text-muted hover:text-red-600 transition-colors"
        >
          Eliminar cuenta
        </button>
      </div>

      {/* Logout confirmation */}
      {showLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowLogout(false)}
        >
          <div
            className="pixel-box w-full max-w-sm bg-surface mx-4 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-pixel text-gold mb-5" style={{ fontSize: '8px', letterSpacing: '0.12em' }}>
              ▸ CONFIRMAR ACCIÓN
            </p>
            <p className="text-sm font-semibold text-text-primary mb-2">¿Cerrar sesión?</p>
            <p className="text-xs text-text-muted mb-8 leading-relaxed">
              Tendrás que volver a iniciar sesión para acceder a tu cuenta y a tus pedidos.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-gold py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-gold-light transition-colors"
              >
                Sí, cerrar sesión
              </button>
              <button
                type="button"
                onClick={() => setShowLogout(false)}
                className="flex-1 border border-border py-2.5 text-xs uppercase tracking-widest text-text-muted hover:border-gold hover:text-text-primary transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirmation */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => { setShowDelete(false); setDeleteError('') }}
        >
          <div
            className="pixel-box w-full max-w-sm bg-surface mx-4 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-pixel mb-5" style={{ fontSize: '8px', letterSpacing: '0.12em', color: '#ef4444' }}>
              ▸ ACCIÓN IRREVERSIBLE
            </p>
            <p className="text-sm font-semibold text-text-primary mb-2">¿Eliminar tu cuenta?</p>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">
              Se eliminarán todos tus datos personales. Esta acción{' '}
              <strong className="text-red-400">no se puede deshacer</strong>.
            </p>
            {deleteError && (
              <div className="mb-5 border border-red-800/50 bg-red-950/30 px-3 py-2.5 text-xs text-red-400 leading-relaxed">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 border border-red-700 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
              <button
                type="button"
                onClick={() => { setShowDelete(false); setDeleteError('') }}
                className="flex-1 border border-border py-2.5 text-xs uppercase tracking-widest text-text-muted hover:border-gold hover:text-text-primary transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
