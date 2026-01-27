'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/useCartStore'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Rehydrate the cart store on mount
    useCartStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  return <>{children}</>
}
