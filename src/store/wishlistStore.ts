'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistStore {
  items: number[] // array of product IDs
  initialized: boolean
  
  fetchWishlist: () => Promise<void>
  toggleWishlist: (productId: number) => Promise<boolean>
  syncWithSupabase: (userId: string) => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      initialized: false,

      fetchWishlist: async () => {
        try {
          const res = await fetch('/api/wishlist')
          if (res.ok) {
            const data = await res.json()
            const serverItems = data.items as number[]
            const localItems = get().items
            const merged = Array.from(new Set([...serverItems, ...localItems]))
            set({ items: merged, initialized: true })
          }
        } catch (err) {
          console.error('Failed to fetch wishlist', err)
          set({ initialized: true })
        }
      },

      toggleWishlist: async (productId: number) => {
        const { items } = get()
        const isCurrentlyWishlisted = items.includes(productId)
        
        // Optimistic update
        set({
          items: isCurrentlyWishlisted 
            ? items.filter((id) => id !== productId)
            : [...items, productId]
        })

        // API call
        try {
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
          })

          if (res.status === 401) {
            // Not logged in, local persistence is fine
            return !isCurrentlyWishlisted
          }

          if (!res.ok) throw new Error('API failed')
          
          const data = await res.json()
          
          // Re-sync with server state just to be sure
          set((state) => ({
            items: data.isWishlisted 
              ? Array.from(new Set([...state.items, productId]))
              : state.items.filter(id => id !== productId)
          }))
          
          return data.isWishlisted
        } catch (err) {
          console.error('Failed to toggle wishlist', err)
          // Revert optimistic update
          set({
            items: isCurrentlyWishlisted
              ? [...items, productId]
              : items.filter(id => id !== productId)
          })
          return isCurrentlyWishlisted
        }
      },

      syncWithSupabase: async (userId: string) => {
        const { items } = get()
        if (!items.length) return

        try {
          await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items),
          })
          await get().fetchWishlist()
        } catch (err) {
          console.error('Wishlist sync failed:', err)
        }
      }
    }),
    {
      name: 'diecast-wishlist',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : sessionStorage
      ),
    }
  )
)
