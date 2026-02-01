import { Suspense } from 'react'
import { getAllProducts, getAllCategories } from '@/lib/api/client'
import { ProductsContent } from './ProductsContent'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic' // Always fetch fresh data

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; subcategory?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const selectedCategory = params.category
  const selectedSubcategory = params.subcategory

  // Fetch data server-side with error handling
  let products: Product[] = []
  let categories: Category[] = []

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getAllProducts({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        limit: 100
      }),
      getAllCategories(),
    ])
    products = productsResponse.products
    categories = categoriesResponse
  } catch (error) {
    console.error('Failed to fetch products or categories:', error)
    // Continue with empty arrays - page will still render
  }

  // Calculate total product count from all categories
  const totalProductCount = categories.reduce(
    (sum, cat) => sum + (cat.productCount ?? 0),
    0
  )

  // Get current category details from fetched categories (which include subcategories)
  let currentCategory = null
  if (selectedCategory) {
    currentCategory = categories.find(cat => cat.slug === selectedCategory) || null
  }

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent
        initialProducts={products}
        categories={categories}
        currentCategory={currentCategory}
        selectedCategorySlug={selectedCategory}
        selectedSubcategorySlug={selectedSubcategory}
        totalProductCount={totalProductCount}
      />
    </Suspense>
  )
}

function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-xl aspect-square"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
