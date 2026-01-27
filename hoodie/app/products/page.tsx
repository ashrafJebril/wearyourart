import { Suspense } from 'react'
import { getAllProducts, getAllCategories, getCategory } from '@/lib/api/client'
import { ProductsContent } from './ProductsContent'

export const dynamic = 'force-dynamic' // Always fetch fresh data

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const selectedCategory = params.category

  // Fetch data server-side
  const [productsResponse, categories] = await Promise.all([
    getAllProducts({ category: selectedCategory, limit: 100 }),
    getAllCategories(),
  ])

  // Calculate total product count from all categories
  const totalProductCount = categories.reduce(
    (sum, cat) => sum + (cat.productCount ?? 0),
    0
  )

  // Get current category details if filtered
  let currentCategory = null
  if (selectedCategory) {
    try {
      currentCategory = await getCategory(selectedCategory)
    } catch {
      // Category not found, ignore
    }
  }

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent
        initialProducts={productsResponse.products}
        categories={categories}
        currentCategory={currentCategory}
        selectedCategorySlug={selectedCategory}
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
