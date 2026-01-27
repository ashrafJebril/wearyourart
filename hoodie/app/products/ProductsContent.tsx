'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/product'
import { Product, Category } from '@/lib/types'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

interface ProductsContentProps {
  initialProducts: Product[]
  categories: Category[]
  currentCategory: Category | null
  selectedCategorySlug?: string
  totalProductCount: number
}

export function ProductsContent({
  initialProducts,
  categories,
  currentCategory,
  selectedCategorySlug,
  totalProductCount,
}: ProductsContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured')

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          {currentCategory ? currentCategory.name : 'All Products'}
        </h1>
        <p className="text-neutral-600 mt-2">
          {currentCategory
            ? currentCategory.description
            : 'Browse our complete collection'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              Categories
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
                <span>All Products</span>
                <span className={`text-xs ${!selectedCategorySlug ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  {totalProductCount}
                </span>
              </Link>
              {categories.map((category) => {
                const isSelected = selectedCategorySlug === category.slug
                return (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className={`text-xs ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {category.productCount ?? 0}
                    </span>
                  </Link>
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
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
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
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-500 mb-6">
                We don&apos;t have any products in this category yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                View all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
