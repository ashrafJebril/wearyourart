import { useQuery } from '@tanstack/react-query'
import { getProducts, getProductById, getProductBySlug } from '../api/client'

interface ProductFilters {
  category?: string
  inStock?: boolean
  search?: string
  page?: number
  limit?: number
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  })
}
