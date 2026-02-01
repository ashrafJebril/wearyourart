'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ProductCanvas, PlacementCustomizer, ColorPicker } from '@/components/customizer'
import type { ProductType } from '@/components/customizer'
import { SizeSelector } from '@/components/product'
import { useCustomizerStore } from '@/lib/store/useCustomizerStore'
import { useCartStore } from '@/lib/store/useCartStore'
import { sizes, getProductById as getLocalProductById, products } from '@/lib/data/products'
import { getProductById as getApiProductById, transformProduct, getAllProducts } from '@/lib/api/client'
import type { Product } from '@/lib/types'
import { useLocalizedContent } from '@/lib/hooks/useLocalizedContent'

// Determine product type from category
function getProductType(category: string): ProductType {
  const normalizedCategory = category.toLowerCase()
  if (normalizedCategory === 't-shirts' || normalizedCategory === 'tshirts' || normalizedCategory === 't-shirt') {
    return 'tshirt'
  }
  // Default to hoodie for hoodies, sweatshirts, etc.
  return 'hoodie'
}

export default function CustomizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product')
  const t = useTranslations('customize')
  const { getName, locale } = useLocalizedContent()

  const [isAdding, setIsAdding] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [customizableProducts, setCustomizableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showSelection, setShowSelection] = useState(false)

  const {
    selectedColor,
    selectedSize,
    setSelectedSize,
    // Front
    decalImage,
    decalPosition,
    decalScale,
    decalRotation,
    textValue,
    textFont,
    textColor,
    textPosition,
    textScale,
    textRotation,
    // Back
    backImage,
    backText,
    backTextFont,
    backTextColor,
    backPosition,
    backScale,
    backRotation,
    // Left shoulder
    leftShoulderImage,
    leftShoulderText,
    leftShoulderTextFont,
    leftShoulderTextColor,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
    // Right shoulder
    rightShoulderImage,
    rightShoulderText,
    rightShoulderTextFont,
    rightShoulderTextColor,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
    resetCustomizer,
  } = useCustomizerStore()
  const { addItem } = useCartStore()

  // Load product data
  useEffect(() => {
    // Reset customizer state when product changes (or on initial load)
    resetCustomizer()

    async function loadProduct() {
      setLoading(true)

      // Always fetch customizable products for selection screen
      try {
        const response = await getAllProducts({ limit: 100 })
        const customizable = response.products.filter(p => p.customizable)
        setCustomizableProducts(customizable)
      } catch {
        // Fallback to local products
        setCustomizableProducts(products.filter(p => p.customizable))
      }

      if (!productId) {
        // Show product selection screen if no product specified
        setShowSelection(true)
        setLoading(false)
        return
      }

      let foundProduct: Product | undefined

      // First try to find in local data (by ID like 'classic-tee')
      foundProduct = getLocalProductById(productId)

      // If not found locally, try to fetch from API (for UUID product IDs)
      if (!foundProduct) {
        try {
          const apiProduct = await getApiProductById(productId)
          foundProduct = transformProduct(apiProduct)
        } catch {
          // API fetch failed, try to find any matching product in local data
          foundProduct = products.find(p =>
            p.id === productId ||
            p.name.toLowerCase().replace(/\s+/g, '-') === productId
          )
        }
      }

      // If still not found, show selection screen
      if (!foundProduct) {
        setShowSelection(true)
        setLoading(false)
        return
      }

      setProduct(foundProduct || null)
      setShowSelection(false)
      setLoading(false)
    }

    loadProduct()
  }, [productId, resetCustomizer])

  // Determine product type based on category
  const productType: ProductType = product ? getProductType(product.category) : 'hoodie'

  // Calculate prices based on customizations
  const basePrice = product?.basePrice || 79.99
  const customizationBasePrice = product?.customizationPrice || 15.0

  const hasFrontCustomization = decalImage || textValue
  const hasBackCustomization = backImage || backText
  const hasShoulderCustomization = leftShoulderImage || leftShoulderText || rightShoulderImage || rightShoulderText

  // Adjust customization prices based on product type
  const frontCustomizationPrice = hasFrontCustomization ? customizationBasePrice : 0
  const backCustomizationPrice = hasBackCustomization ? (customizationBasePrice * 0.8) : 0
  const shoulderCustomizationPrice = hasShoulderCustomization ? (customizationBasePrice * 0.5) : 0
  const totalPrice = basePrice + frontCustomizationPrice + backCustomizationPrice + shoulderCustomizationPrice

  const hasAnyCustomization = hasFrontCustomization || hasBackCustomization || hasShoulderCustomization

  const handleAddToCart = () => {
    if (!product) return

    setIsAdding(true)

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      price: totalPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      customization: hasAnyCustomization
        ? {
            decalImage,
            decalPosition,
            decalScale,
            decalRotation,
            textValue,
            textFont,
            textColor,
            textPosition,
            textScale,
            textRotation,
            backImage,
            backText,
            backTextFont,
            backTextColor,
            backPosition,
            backScale,
            backRotation,
            leftShoulderImage,
            leftShoulderText,
            leftShoulderTextFont,
            leftShoulderTextColor,
            leftShoulderPosition,
            leftShoulderScale,
            leftShoulderRotation,
            rightShoulderImage,
            rightShoulderText,
            rightShoulderTextFont,
            rightShoulderTextColor,
            rightShoulderPosition,
            rightShoulderScale,
            rightShoulderRotation,
          }
        : undefined,
    })

    setTimeout(() => {
      setIsAdding(false)
      resetCustomizer()
    }, 500)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">{t('loadingCustomizer')}</p>
        </div>
      </div>
    )
  }

  // Show product selection screen
  if (showSelection) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
              {t('chooseProductToCustomize')}
            </h1>
            <p className="text-neutral-600 mt-3 text-lg">
              {t('selectItemToPersonalize')}
            </p>
          </div>

          {customizableProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {customizableProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/customize?product=${prod.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100"
                >
                  <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                    {prod.images[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={getName(prod)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {getName(prod)}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {t('startingAt')} {prod.basePrice.toFixed(2)} JD
                    </p>
                    <div className={`mt-3 flex items-center text-sm text-primary-600 font-medium ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span>{t('customizeNow')}</span>
                      <svg className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900">{t('noCustomizableProducts')}</h3>
              <p className="text-neutral-500 mt-2">{t('checkBackLater')}</p>
              <Link href="/products" className="btn-primary mt-6 inline-block">
                {t('browseAllProducts')}
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show error if product not found or not customizable
  if (!product) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">{t('productNotFound')}</h1>
          <p className="text-neutral-600 mt-2">{t('productNotFoundDesc')}</p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary mt-4"
          >
            {t('browseProducts')}
          </button>
        </div>
      </div>
    )
  }

  // Check if product type has 3D model support
  const supportedCategories = ['hoodies', 't-shirts']
  if (!supportedCategories.includes(product.category)) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">{t('customizationComingSoon')}</h1>
          <p className="text-neutral-600 mt-2">
            {t('customizationNotAvailable')}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary mt-4"
          >
            {t('browseProducts')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* 3D Canvas */}
      <div className="flex-1 p-4 lg:p-6 min-h-[50vh] lg:min-h-0">
        <ProductCanvas productType={productType} />
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {productType === 'tshirt' ? t('designYourTshirt') : t('designYourHoodie')}
            </h1>
            <p className="text-neutral-500 mt-1">
              {getName(product)} - {t('choosePlacementAndAdd')}
            </p>
          </div>

          {/* Unified Placement Customizer */}
          <PlacementCustomizer />

          {/* Color Selection */}
          <div>
            <ColorPicker productType={productType} />
          </div>

          {/* Size Selection */}
          <SizeSelector
            sizes={product.sizes || sizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
            productType={productType}
          />

          {/* Price Summary */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">{productType === 'tshirt' ? t('baseTshirt') : t('baseHoodie')}</span>
              <span className="font-medium">{basePrice.toFixed(2)} JD</span>
            </div>
            {hasFrontCustomization && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">{t('frontDesign')}</span>
                <span className="font-medium">
                  +{frontCustomizationPrice.toFixed(2)} JD
                </span>
              </div>
            )}
            {hasBackCustomization && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">{t('backDesign')}</span>
                <span className="font-medium">
                  +{backCustomizationPrice.toFixed(2)} JD
                </span>
              </div>
            )}
            {hasShoulderCustomization && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">{productType === 'tshirt' ? t('sleeveDesign') : t('shoulderDesign')}</span>
                <span className="font-medium">
                  +{shoulderCustomizationPrice.toFixed(2)} JD
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold border-t border-neutral-200 pt-2">
              <span>{t('total')}</span>
              <span>{totalPrice.toFixed(2)} JD</span>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isAdding ? t('adding') : t('addToCart')}
          </button>

          {/* Back to Products */}
          <button
            onClick={() => router.push('/products')}
            className="btn-ghost w-full"
          >
            {t('browseOtherStyles')}
          </button>
        </div>
      </div>
    </div>
  )
}
