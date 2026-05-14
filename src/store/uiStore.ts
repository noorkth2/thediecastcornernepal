'use client'

import { create } from 'zustand'

interface UIStore {
  // Mobile nav
  isMobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void

  // Search
  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  // Toast
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Mobile nav
  isMobileNavOpen: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () =>
    set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),

  // Search
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // Toast
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    const duration = toast.duration ?? 3500
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
