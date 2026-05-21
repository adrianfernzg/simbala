'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type CartExtra = {
  extraId: string
  extraName: string
  price: number
  value?: string
}

export type CartItem = {
  id: string // productId + sorted extraIds as composite key
  productId: string
  productName: string
  productSlug: string
  productImage: string | null
  basePrice: number
  selectedExtras: CartExtra[]
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'simbala_cart'

function buildItemId(productId: string, extras: CartExtra[]): string {
  const extrasKey = extras
    .map((e) => `${e.extraId}${e.value ? `:${e.value}` : ''}`)
    .sort()
    .join('|')
  return extrasKey ? `${productId}|${extrasKey}` : productId
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = buildItemId(item.productId, item.selectedExtras)
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, { ...item, id }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce(
    (sum, i) =>
      sum +
      (i.basePrice + i.selectedExtras.reduce((s, e) => s + e.price, 0)) * i.quantity,
    0
  )

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
