'use client'

import { CartItem as CartItemType } from '@/lib/types'
import { useCartStore } from '@/lib/store/useCartStore'

interface CartItemProps {
  item: CartItemType
  showControls?: boolean
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-0">
      {/* Image */}
      <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.customization?.decalImage ? (
          <div className="w-full h-full relative">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: item.color.hex }}
            />
            <img
              src={item.customization.decalImage}
              alt="Custom design"
              className="absolute inset-2 w-auto h-auto max-w-[60%] max-h-[60%] m-auto object-contain"
            />
          </div>
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: item.color.hex }}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-neutral-900 truncate">{item.name}</h3>
        <p className="text-sm text-neutral-500">
          {item.color.name} / {item.size}
        </p>
        {item.customization && (
          <p className="text-sm text-primary-600">Custom Design</p>
        )}

        {showControls && (
          <div className="flex items-center gap-3 mt-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-neutral-200 rounded-lg">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-medium text-neutral-900">
          {(item.price * item.quantity).toFixed(2)} JD
        </p>
        {item.quantity > 1 && (
          <p className="text-sm text-neutral-500">{item.price.toFixed(2)} JD each</p>
        )}
      </div>
    </div>
  )
}
