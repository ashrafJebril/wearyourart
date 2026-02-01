'use client'

import { useLocale } from 'next-intl'
import { Product, Category, Subcategory } from '@/lib/types'

interface Localizable {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
}

export function useLocalizedContent() {
  const locale = useLocale()
  const isRTL = locale === 'ar'

  /**
   * Get localized name from an item
   * Falls back to English if Arabic is not available
   */
  const getName = <T extends { name: string; nameAr?: string }>(item: T): string => {
    if (locale === 'ar' && item.nameAr) {
      return item.nameAr
    }
    return item.name
  }

  /**
   * Get localized description from an item
   * Falls back to English if Arabic is not available
   */
  const getDescription = <T extends { description?: string; descriptionAr?: string }>(item: T): string => {
    if (locale === 'ar' && item.descriptionAr) {
      return item.descriptionAr
    }
    return item.description || ''
  }

  /**
   * Localize a product
   */
  const localizeProduct = (product: Product) => ({
    ...product,
    localizedName: getName(product),
    localizedDescription: getDescription(product),
  })

  /**
   * Localize a category
   */
  const localizeCategory = (category: Category) => ({
    ...category,
    localizedName: getName(category),
    localizedDescription: getDescription(category),
    subcategories: category.subcategories?.map(sub => ({
      ...sub,
      localizedName: getName(sub),
      localizedDescription: getDescription(sub),
    })),
  })

  /**
   * Localize a subcategory
   */
  const localizeSubcategory = (subcategory: Subcategory) => ({
    ...subcategory,
    localizedName: getName(subcategory),
    localizedDescription: getDescription(subcategory),
  })

  return {
    locale,
    isRTL,
    getName,
    getDescription,
    localizeProduct,
    localizeCategory,
    localizeSubcategory,
  }
}
