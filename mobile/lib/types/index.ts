export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  featured: boolean
  productCount?: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  basePrice: number
  customizationPrice: number
  images: string[]
  colors: ProductColor[]
  sizes: string[]
  features: string[]
  category: string
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
  color: ProductColor
  size: string
  quantity: number
  price: number
  image: string
  customization?: CustomizationData
}

export interface CustomizationData {
  // Front customization
  decalImage: string | null
  decalImageId?: string
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
  backImage?: string | null
  backImageId?: string
  backText?: string
  backTextFont?: string
  backTextColor?: string
  backPosition?: { x: number; y: number }
  backScale?: number
  backRotation?: number

  // Left shoulder customization
  leftShoulderImage?: string | null
  leftShoulderImageId?: string
  leftShoulderText?: string
  leftShoulderTextFont?: string
  leftShoulderTextColor?: string
  leftShoulderPosition?: { x: number; y: number }
  leftShoulderScale?: number
  leftShoulderRotation?: number

  // Right shoulder customization
  rightShoulderImage?: string | null
  rightShoulderImageId?: string
  rightShoulderText?: string
  rightShoulderTextFont?: string
  rightShoulderTextColor?: string
  rightShoulderPosition?: { x: number; y: number }
  rightShoulderScale?: number
  rightShoulderRotation?: number
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

export interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'DELIVERED' | 'CANCELLED'
  customerName: string
  customerEmail: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  color: string
  size: string
  price: number
  customization?: CustomizationData
  isCustomized: boolean
  screenshots?: ScreenshotUrls
}
