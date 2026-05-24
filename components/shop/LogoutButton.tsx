'use client'

import { signOut } from 'next-auth/react'

const CART_STORAGE_KEY = 'simbala_cart'

interface LogoutButtonProps {
  locale: string
}

export function LogoutButton({ locale }: LogoutButtonProps) {
  async function handleLogout() {
    localStorage.removeItem(CART_STORAGE_KEY)
    await signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs uppercase tracking-widest text-text-muted hover:text-red-400 transition-colors"
    >
      Cerrar sesión
    </button>
  )
}
