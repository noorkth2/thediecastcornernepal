'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartEntry, CartProduct } from '@/lib/types'

interface CartStore {
  items: CartEntry[]
  isOpen: boolean

  // Actions
  addItem: (product: CartProduct, qty?: number) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  totalItems: () => number
  totalPrice: () => number

  // Supabase sync
  syncWithSupabase: (userId: string) => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + qty, product.stock_qty),
                    }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { product, quantity: Math.min(qty, product.stock_qty) },
            ],
          }
        })
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty === 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity: qty } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),

      // Sync guest cart to Supabase after login
      syncWithSupabase: async (userId) => {
        const { items } = get()
        if (!items.length) return

        try {
          const payload = items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          }))

          const res = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!res.ok) {
            console.error('Cart sync failed:', await res.text())
          }
        } catch (err) {
          console.error('Cart sync failed:', err)
        }
      },
    }),
    {
      name: 'diecast-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : sessionStorage
      ),
    }
  )
)
