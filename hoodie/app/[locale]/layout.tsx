import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { HeaderWrapper } from '@/components/layout/HeaderWrapper'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { StoreProvider } from '@/components/providers/StoreProvider'
import { LocaleUpdater } from '@/components/providers/LocaleUpdater'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const isRTL = locale === 'ar'

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Amman">
      <StoreProvider>
        <LocaleUpdater locale={locale} isRTL={isRTL} />
        <div className="min-h-screen flex flex-col">
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </div>
      </StoreProvider>
    </NextIntlClientProvider>
  )
}
