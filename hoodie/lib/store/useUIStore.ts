'use client'

import { create } from 'zustand'

interface UIStore {
  isMobileMenuOpen: boolean
  activeModal: string | null

  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  activeModal: null,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),
}))
