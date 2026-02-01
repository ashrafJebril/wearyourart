'use client'

import { useEffect } from 'react'

interface LocaleUpdaterProps {
  locale: string
  isRTL: boolean
}

export function LocaleUpdater({ locale, isRTL }: LocaleUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'

    // Update body font class
    document.body.classList.remove('font-inter', 'font-cairo')
    document.body.classList.add(isRTL ? 'font-cairo' : 'font-inter')
  }, [locale, isRTL])

  return null
}
