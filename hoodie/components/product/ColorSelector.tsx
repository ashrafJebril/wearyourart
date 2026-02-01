'use client'

import { ProductColor } from '@/lib/types'
import { useTranslations } from 'next-intl'

interface ColorSelectorProps {
  colors: ProductColor[]
  selectedColor: ProductColor
  onSelect: (color: ProductColor) => void
}

export function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  const t = useTranslations('products')

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-900">
          {t('color')}: <span className="font-normal text-neutral-600">{selectedColor.name}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelect(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              selectedColor.id === color.id
                ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                : 'border-neutral-200 hover:border-neutral-400'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {selectedColor.id === color.id && (
              <svg
                className={`w-5 h-5 mx-auto ${
                  ['white', 'cream', 'heather-gray'].includes(color.id)
                    ? 'text-neutral-900'
                    : 'text-white'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
