'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SizeSelector, ColorSelector, QuantitySelector } from '@/components/product'
import { useCartStore } from '@/lib/store/useCartStore'
import { Product, ProductColor } from '@/lib/types'
import { getImagesForColor, getPrimaryImageForColor } from '@/lib/utils/productImages'
import { useLocalizedContent } from '@/lib/hooks'
import { useTranslations } from 'next-intl'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const { getName, getDescription } = useLocalizedContent()
  const t = useTranslations('products')
  const tCommon = useTranslations('common')

  const localizedName = getName(product)
  const localizedDescription = getDescription(product)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes.includes('M') ? 'M' : product.sizes[0])
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0])
  const [quantity, setQuantity] = useState(1)

  // Get images for the currently selected color
  const currentImages = useMemo(() => {
    return getImagesForColor(product, selectedColor)
  }, [product, selectedColor])

  // Handle color change - reset image selection
  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color)
    setSelectedImage(0) // Reset to first image when color changes
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: product.price,
      image: getPrimaryImageForColor(product, selectedColor),
    })
  }

  const handleCustomize = () => {
    router.push(`/customize?product=${product.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-neutral-500 hover:text-neutral-900">
              {tCommon('home')}
            </Link>
          </li>
          <li className="text-neutral-400">/</li>
          <li>
            <Link href="/products" className="text-neutral-500 hover:text-neutral-900">
              {t('pageTitle')}
            </Link>
          </li>
          <li className="text-neutral-400">/</li>
          <li className="text-neutral-900 font-medium">{localizedName}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
            <img
              src={currentImages[selectedImage] || currentImages[0]}
              alt={localizedName}
              className="w-full h-full object-cover"
            />
          </div>
          {currentImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-neutral-900'
                      : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${localizedName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
              {localizedName}
            </h1>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">
              {product.price.toFixed(2)} JD
            </p>
          </div>

          <p className="text-neutral-600 leading-relaxed">{localizedDescription}</p>

          <ColorSelector
            colors={product.colors}
            selectedColor={selectedColor}
            onSelect={handleColorChange}
          />

          <SizeSelector
            sizes={product.sizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          <QuantitySelector quantity={quantity} onChange={setQuantity} />

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              {tCommon('addToCart')}
            </button>
            {product.customizable && (
              <button onClick={handleCustomize} className="btn-secondary flex-1">
                {t('customizeThisProduct')}
              </button>
            )}
          </div>

          {product.features.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">{t('features')}</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-neutral-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
