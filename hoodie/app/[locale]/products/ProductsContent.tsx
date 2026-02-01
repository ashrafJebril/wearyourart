'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/product'
import { Product, Category } from '@/lib/types'
import { useLocalizedContent } from '@/lib/hooks'
import { useTranslations } from 'next-intl'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

interface ProductsContentProps {
  initialProducts: Product[]
  categories: Category[]
  currentCategory: Category | null
  selectedCategorySlug?: string
  selectedSubcategorySlug?: string
  totalProductCount: number
}

export function ProductsContent({
  initialProducts,
  categories,
  currentCategory,
  selectedCategorySlug,
  selectedSubcategorySlug,
  totalProductCount,
}: ProductsContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const { getName, getDescription } = useLocalizedContent()
  const t = useTranslations('products')

  const sortedProducts = useMemo(() => {
    const result = [...initialProducts]

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [initialProducts, sortBy])

  // Find current subcategory if selected
  const currentSubcategory = currentCategory?.subcategories?.find(
    sub => sub.slug === selectedSubcategorySlug
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          {currentSubcategory
            ? getName(currentSubcategory)
            : currentCategory
              ? getName(currentCategory)
              : t('allProducts')}
        </h1>
        <p className="text-neutral-600 mt-2">
          {currentSubcategory
            ? getDescription(currentSubcategory) || `Browse ${getName(currentSubcategory)}`
            : currentCategory
              ? getDescription(currentCategory)
              : t('noProductsFound')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {t('categories')}
            </h2>
            <nav className="space-y-1">
              <Link
                href="/products"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategorySlug
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span>{t('allProducts')}</span>
                <span className={`text-xs ${!selectedCategorySlug ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  {totalProductCount}
                </span>
              </Link>
              {categories.map((category) => {
                const isCategorySelected = selectedCategorySlug === category.slug
                const hasSubcategories = category.subcategories && category.subcategories.length > 0
                return (
                  <div key={category.slug}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isCategorySelected && !selectedSubcategorySlug
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <span>{getName(category)}</span>
                      <span className={`text-xs ${isCategorySelected && !selectedSubcategorySlug ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        {category.productCount ?? 0}
                      </span>
                    </Link>
                    {/* Show subcategories when this category is selected */}
                    {isCategorySelected && hasSubcategories && (
                      <div className="ms-4 mt-1 space-y-1">
                        {category.subcategories!.map((sub) => {
                          const isSubSelected = selectedSubcategorySlug === sub.slug
                          return (
                            <Link
                              key={sub.slug}
                              href={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                isSubSelected
                                  ? 'bg-neutral-700 text-white'
                                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                              }`}
                            >
                              <span>{getName(sub)}</span>
                              <span className={`text-xs ${isSubSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                                {sub.productCount ?? 0}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Filters & Sort */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-neutral-500">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-neutral-600">
                {t('sortBy')}:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
              >
                <option value="featured">{t('newest')}</option>
                <option value="price-asc">{t('priceLowToHigh')}</option>
                <option value="price-desc">{t('priceHighToLow')}</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} columns={3} />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('noProductsFound')}</h3>
              <p className="text-neutral-500 mb-6">
                {t('noProductsInCategory')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t('allProducts')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
