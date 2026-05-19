'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartEntry, CartProduct } from '@/lib/types'

interface CartStore {
  items: CartEntry[]
  isOpen: boolean

  // Actions
  addItem: (product: CartProduct, qty?: number) => Promise<void>
  removeItem: (productId: number, variantId?: number) => Promise<void>
  updateQty: (productId: number, qty: number, variantId?: number) => void
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

      addItem: async (product, qty = 1) => {
        try {
          const res = await fetch('/api/cart/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: product.id, 
              variantId: product.variant_id || null, 
              quantity: qty 
            }),
          })
          
          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to reserve stock')
          }
          
          const data = await res.json()

          set((state) => {
            const existing = state.items.find(
              (i) => i.product.id === product.id && i.product.variant_id === product.variant_id
            )
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id && i.product.variant_id === product.variant_id
                    ? {
                        ...i,
                        quantity: Math.min(i.quantity + qty, product.stock_qty),
                        reservation_id: data.reservation_id,
                        expires_at: data.expires_at,
                      }
                    : i
                ),
              }
            }
            return {
              items: [
                ...state.items,
                { 
                  product, 
                  quantity: Math.min(qty, product.stock_qty),
                  reservation_id: data.reservation_id,
                  expires_at: data.expires_at,
                },
              ],
            }
          })
        } catch (error) {
          console.error('Reservation failed:', error)
          throw error
        }
      },

      removeItem: async (productId, variantId) => {
        const state = get()
        const item = state.items.find((i) => i.product.id === productId && i.product.variant_id === variantId)
        
        if (item?.reservation_id) {
          try {
            await fetch(`/api/cart/reserve?id=${item.reservation_id}`, { method: 'DELETE' })
          } catch (e) {
            console.error('Failed to release reservation', e)
          }
        }

        set((state) => ({
          items: state.items.filter((i) => !(i.product.id === productId && i.product.variant_id === variantId)),
        }))
      },

      updateQty: (productId, qty, variantId) =>
        set((state) => ({
          items:
            qty === 0
              ? state.items.filter((i) => !(i.product.id === productId && i.product.variant_id === variantId))
              : state.items.map((i) =>
                  i.product.id === productId && i.product.variant_id === variantId 
                    ? { ...i, quantity: qty } 
                    : i
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
            variant_id: i.product.variant_id || null,
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
