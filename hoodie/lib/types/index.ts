export interface Subcategory {
  id: string
  name: string
  nameAr?: string
  slug: string
  description: string
  descriptionAr?: string
  image: string
  productCount?: number
}

export interface Category {
  id: string
  name: string
  nameAr?: string
  slug: string
  description: string
  descriptionAr?: string
  image: string
  featured: boolean
  productCount?: number
  subcategories?: Subcategory[]
}

export type ColorImages = Record<string, string[]>

export interface Product {
  id: string
  name: string
  nameAr?: string
  description: string
  descriptionAr?: string
  price: number
  basePrice: number
  customizationPrice: number
  images: string[]
  colorImages?: ColorImages
  colors: ProductColor[]
  sizes: string[]
  features: string[]
  category: string
  subcategory?: string
  tags: string[]
  inStock: boolean
  customizable: boolean
}

export interface ProductColor {
  id: string
  name: string
  hex: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  nameAr?: string
  color: ProductColor
  size: string
  quantity: number
  price: number
  image: string
  customization?: CustomizationData
}

/**
 * Customization data for a product
 * Image fields (decalImage, backImage, etc.) store URLs from DigitalOcean Spaces CDN
 * Images are uploaded immediately when user selects them in the customizer
 */
export interface CustomizationData {
  // Front customization
  decalImage: string | null        // CDN URL (uploaded to Spaces)
  decalImageId?: string            // DesignImage ID for reference
  decalPosition: { x: number; y: number; z: number }
  decalScale: number
  decalRotation: number
  textValue?: string
  textFont?: string
  textColor?: string
  textPosition?: { x: number; y: number }
  textScale?: number
  textRotation?: number

  // Back customization
  backImage?: string | null        // CDN URL (uploaded to Spaces)
  backImageId?: string             // DesignImage ID for reference
  backText?: string
  backTextFont?: string
  backTextColor?: string
  backPosition?: { x: number; y: number }
  backScale?: number
  backRotation?: number

  // Left shoulder customization
  leftShoulderImage?: string | null // CDN URL (uploaded to Spaces)
  leftShoulderImageId?: string      // DesignImage ID for reference
  leftShoulderText?: string
  leftShoulderTextFont?: string
  leftShoulderTextColor?: string
  leftShoulderPosition?: { x: number; y: number }
  leftShoulderScale?: number
  leftShoulderRotation?: number

  // Right shoulder customization
  rightShoulderImage?: string | null // CDN URL (uploaded to Spaces)
  rightShoulderImageId?: string      // DesignImage ID for reference
  rightShoulderText?: string
  rightShoulderTextFont?: string
  rightShoulderTextColor?: string
  rightShoulderPosition?: { x: number; y: number }
  rightShoulderScale?: number
  rightShoulderRotation?: number
}

export interface CustomizerState {
  hoodieColor: string
  decalImage: string | null
  decalPosition: { x: number; y: number; z: number }
  decalScale: number
  decalRotation: number
  selectedSize: string
  selectedColor: ProductColor
  isLoading: boolean
}

export interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderSummary {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface ScreenshotUrls {
  front: string
  back: string
  left: string
  right: string
}

export interface OrderItemWithScreenshots {
  itemId: string
  screenshots: ScreenshotUrls
}
