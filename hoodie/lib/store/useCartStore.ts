'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/lib/types'

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface CartStore {
  items: CartItem[]
  isCartOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (item) => {
        const id = `${item.productId}-${item.color.id}-${item.size}-${Date.now()}`
        set((state) => ({
          items: [...state.items, { ...item, id }],
          isCartOpen: true,
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        set((state) => ({ isCartOpen: !state.isCartOpen }))
      },

      openCart: () => {
        set({ isCartOpen: true })
      },

      closeCart: () => {
        set({ isCartOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'hoodie-cart',
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      // Migrate old cart items - filter out items with non-UUID productIds
      migrate: (persistedState: any) => {
        if (persistedState && persistedState.items) {
          const validItems = persistedState.items.filter((item: CartItem) =>
            UUID_REGEX.test(item.productId)
          )
          return { ...persistedState, items: validItems }
        }
        return persistedState
      },
      version: 1, // Increment this to trigger migration
    }
  )
)
