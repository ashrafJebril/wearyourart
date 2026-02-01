import Link from 'next/link'
import { ProductGrid } from '@/components/product'
import { getFeaturedProducts } from '@/lib/api/client'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic' // Always fetch fresh data

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              {t('heroTitle')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                {t('heroTitleHighlight')}
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-xl">
              {t('heroDescription')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/customize"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
              >
                {t('startDesigning')}
                <svg
                  className="w-5 h-5 ms-2 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 border border-neutral-700 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {t('shopCollection')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-neutral-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t('uploadDesign')}
              </h3>
              <p className="text-neutral-600">
                {t('uploadDesignDesc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-neutral-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t('previewIn3D')}
              </h3>
              <p className="text-neutral-600">
                {t('previewIn3DDesc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-neutral-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t('fastDelivery')}
              </h3>
              <p className="text-neutral-600">
                {t('fastDeliveryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                {t('featuredProducts')}
              </h2>
              <p className="text-neutral-600 mt-2">
                {t('featuredProductsDesc')}
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center text-neutral-900 font-medium hover:text-primary-600 transition-colors"
            >
              {tCommon('viewAll')}
              <svg
                className="w-4 h-4 ms-1 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <ProductGrid products={featuredProducts} columns={2} />

          <div className="mt-10 text-center sm:hidden">
            <Link href="/products" className="btn-secondary">
              {t('viewAllProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <Link
            href="/customize"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
          >
            {t('startCustomizingNow')}
          </Link>
        </div>
      </section>
    </>
  )
}
