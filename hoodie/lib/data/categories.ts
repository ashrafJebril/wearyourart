import { Category } from '@/lib/types'

export const categories: Category[] = [
  {
    id: 'hoodies',
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Premium hoodies for everyday comfort',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    featured: true,
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Classic tees for any occasion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    featured: true,
  },
  {
    id: 'sweatshirts',
    name: 'Sweatshirts',
    slug: 'sweatshirts',
    description: 'Cozy crew necks and pullovers',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop',
    featured: true,
  },
  {
    id: 'jackets',
    name: 'Jackets',
    slug: 'jackets',
    description: 'Stylish outerwear for all seasons',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    featured: false,
  },
  {
    id: 'pants',
    name: 'Pants',
    slug: 'pants',
    description: 'Comfortable joggers and sweatpants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
    featured: false,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Hats, bags, and more',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    featured: false,
  },
]

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug)
}

export const getFeaturedCategories = (): Category[] => {
  return categories.filter((cat) => cat.featured)
}
