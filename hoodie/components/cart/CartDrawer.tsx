'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/useCartStore'
import { CartItem } from './CartItem'

export function CartDrawer() {
  const { items, isCartOpen, closeCart, getTotalPrice } = useCartStore()
  const total = getTotalPrice()

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-neutral-500 mb-4">Your cart is empty</p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-neutral-100 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-lg font-semibold">${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-neutral-500">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full text-center"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary w-full text-center"
              >
                View Full Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
