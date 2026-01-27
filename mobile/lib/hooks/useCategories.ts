import { useQuery } from '@tanstack/react-query'
import { getCategories, getCategoryBySlug } from '../api/client'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  })
}
