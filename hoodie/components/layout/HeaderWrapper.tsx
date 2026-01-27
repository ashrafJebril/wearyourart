import { getAllCategories, getAllProducts } from '@/lib/api/client'
import { Header } from './Header'

export async function HeaderWrapper() {
  let categories = []
  let customizableProducts = []

  try {
    const [fetchedCategories, productsResponse] = await Promise.all([
      getAllCategories(),
      getAllProducts({ limit: 100 }),
    ])
    categories = fetchedCategories
    customizableProducts = productsResponse.products.filter(p => p.customizable)
  } catch (error) {
    // If API fails, render header without categories
    console.error('Failed to fetch data for header:', error)
  }

  return <Header categories={categories} customizableProducts={customizableProducts} />
}
