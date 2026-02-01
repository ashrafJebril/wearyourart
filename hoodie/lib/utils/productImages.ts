import { Product, ProductColor } from '@/lib/types'

/**
 * Get images for a specific color, falling back to default images
 */
export function getImagesForColor(
  product: Product,
  color: ProductColor
): string[] {
  // Check if colorImages exists and has images for this color
  if (product.colorImages && product.colorImages[color.hex]?.length > 0) {
    return product.colorImages[color.hex]
  }
  // Fallback to default images
  return product.images
}

/**
 * Get the primary image for a color (first image)
 */
export function getPrimaryImageForColor(
  product: Product,
  color: ProductColor
): string {
  const images = getImagesForColor(product, color)
  return images[0] || ''
}

/**
 * Check if a color has specific images assigned
 */
export function hasColorSpecificImages(
  product: Product,
  color: ProductColor
): boolean {
  return !!(product.colorImages && product.colorImages[color.hex]?.length > 0)
}
