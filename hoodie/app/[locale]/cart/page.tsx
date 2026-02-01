'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CartItem } from '@/components/cart'
import { useCartStore } from '@/lib/store/useCartStore'

export default function CartPage() {
  const t = useTranslations('cart')
  const { items, clearCart, getTotalPrice } = useCartStore()
  const subtotal = getTotalPrice()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-24 h-24 text-neutral-300 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          {t('cartIsEmpty')}
        </h1>
        <p className="text-neutral-500 mb-8">
          {t('noProductsYet')}
        </p>
        <Link href="/products" className="btn-primary">
          {t('startShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
        <button
          onClick={clearCart}
          className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
        >
          {t('clearCart')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.id} className="p-6">
                <CartItem item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">
              {t('orderSummary')}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('subtotal')}</span>
                <span className="font-medium">{subtotal.toFixed(2)} JD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('shipping')}</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">{t('free')}</span>
                  ) : (
                    `${shipping.toFixed(2)} JD`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('estimatedTax')}</span>
                <span className="font-medium">{tax.toFixed(2)} JD</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 pt-4">
                <span>{t('total')}</span>
                <span>{total.toFixed(2)} JD</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-sm text-neutral-500 mb-6">
                {t('freeShippingMessage', { amount: (100 - subtotal).toFixed(2) })}
              </p>
            )}

            <Link href="/checkout" className="btn-primary w-full text-center">
              {t('proceedToCheckout')}
            </Link>

            <Link href="/products" className="btn-ghost w-full text-center mt-3">
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
