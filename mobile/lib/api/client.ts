import { API_URL } from '../constants/api'
import type { Category, Product, Order, CartItem } from '../types'

interface FetchOptions extends RequestInit {
  timeout?: number
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options
  const url = `${API_URL}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/categories')
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchApi<Category>(`/categories/slug/${slug}`)
}

// Products API
interface ProductsResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

interface ProductFilters {
  category?: string
  inStock?: boolean
  search?: string
  page?: number
  limit?: number
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams()

  if (filters.category) params.append('category', filters.category)
  if (filters.inStock !== undefined) params.append('inStock', String(filters.inStock))
  if (filters.search) params.append('search', filters.search)
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))

  const queryString = params.toString()
  const endpoint = queryString ? `/products?${queryString}` : '/products'

  return fetchApi<ProductsResponse>(endpoint)
}

export async function getProductById(id: string): Promise<Product> {
  return fetchApi<Product>(`/products/${id}`)
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return fetchApi<Product>(`/products/slug/${slug}`)
}

// Orders API
interface CreateOrderData {
  customerName: string
  customerEmail: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
  items: {
    productId: string
    quantity: number
    color: string
    size: string
    price: number
    customization?: any
    isCustomized?: boolean
  }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  return fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  return fetchApi<Order>(`/orders/number/${orderNumber}`)
}

interface ScreenshotUpload {
  front: string
  back: string
  left: string
  right: string
}

export async function uploadOrderScreenshots(
  orderId: string,
  itemId: string,
  screenshots: ScreenshotUpload
): Promise<{ screenshots: ScreenshotUpload }> {
  return fetchApi(`/orders/${orderId}/items/${itemId}/screenshots`, {
    method: 'POST',
    body: JSON.stringify(screenshots),
  })
}

// Upload API
interface DesignUploadData {
  base64: string
  placement: string
  sessionId: string
}

interface DesignUploadResponse {
  id: string
  url: string
}

export async function uploadDesignImage(data: DesignUploadData): Promise<DesignUploadResponse> {
  return fetchApi<DesignUploadResponse>('/upload/design', {
    method: 'POST',
    body: JSON.stringify(data),
    timeout: 30000, // Longer timeout for uploads
  })
}

interface LibraryImage {
  id: string
  url: string
  filename: string
}

export async function getLibraryImages(): Promise<LibraryImage[]> {
  return fetchApi<LibraryImage[]>('/upload/public')
}
