'use client'

import { useTranslations } from 'next-intl'
import { ProductColor } from '@/lib/types'
import { useCustomizerStore } from '@/lib/store/useCustomizerStore'
import { colors } from '@/lib/data/products'

interface ColorPickerProps {
  productType?: 'hoodie' | 'tshirt'
}

export function ColorPicker({ productType = 'hoodie' }: ColorPickerProps) {
  const t = useTranslations('customize')
  const { selectedColor, setSelectedColor } = useCustomizerStore()

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-900">
          {productType === 'tshirt' ? t('tshirtColor') : t('hoodieColor')}
        </span>
        <span className="text-sm text-neutral-500">{selectedColor.name}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorSelect(color)}
            className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
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
