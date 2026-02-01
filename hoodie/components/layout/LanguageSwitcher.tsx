'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from pathname and add the new one
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '')
    // Preserve query parameters
    const queryString = searchParams.toString()
    const newUrl = `/${newLocale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`
    startTransition(() => {
      router.push(newUrl)
    })
  }

  return (
    <button
      onClick={() => switchLocale(locale === 'en' ? 'ar' : 'en')}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span>{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  )
}
