const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Categories API
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export async function getCategories(): Promise<ApiCategory[]> {
  return fetchApi<ApiCategory[]>('/categories', {
    cache: 'no-store',
  });
}

export async function getCategoryBySlug(slug: string): Promise<ApiCategory> {
  return fetchApi<ApiCategory>(`/categories/slug/${slug}`, {
    cache: 'no-store',
  });
}

export async function getCategoryById(id: string): Promise<ApiCategory> {
  return fetchApi<ApiCategory>(`/categories/${id}`, {
    cache: 'no-store',
  });
}

// Products API
export interface ApiProductColor {
  name: string;
  hex: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string | number;
  customizationPrice: string | number;
  images: string[];
  colors: ApiProductColor[];
  sizes: string[];
  features: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  inStock: boolean;
  customizable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: ApiProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: string;
  inStock?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.inStock) params.append('inStock', filters.inStock);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const query = params.toString();
  return fetchApi<ProductsResponse>(`/products${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });
}

export async function getProductById(id: string): Promise<ApiProduct> {
  return fetchApi<ApiProduct>(`/products/${id}`, {
    cache: 'no-store',
  });
}

export async function getProductBySlug(slug: string): Promise<ApiProduct> {
  return fetchApi<ApiProduct>(`/products/slug/${slug}`, {
    cache: 'no-store',
  });
}

// Orders API
export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  items: {
    productId: string;
    quantity: number;
    color: string;
    size: string;
    price: number;
    customization?: any;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: any;
  items: any[];
  subtotal: string | number;
  shipping: string | number;
  tax: string | number;
  total: string | number;
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(data: CreateOrderData): Promise<ApiOrder> {
  return fetchApi<ApiOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
    cache: 'no-store',
  });
}

export async function getOrderByNumber(orderNumber: string): Promise<ApiOrder> {
  return fetchApi<ApiOrder>(`/orders/number/${orderNumber}`, {
    cache: 'no-store',
  });
}

export interface ScreenshotUrls {
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface UploadScreenshotsData {
  items: Array<{
    itemId: string;
    screenshots: {
      front: string;
      back: string;
      left: string;
      right: string;
    };
  }>;
}

export async function uploadOrderScreenshots(
  orderId: string,
  data: UploadScreenshotsData
): Promise<Record<string, ScreenshotUrls>> {
  return fetchApi<Record<string, ScreenshotUrls>>(`/orders/${orderId}/screenshots`, {
    method: 'POST',
    body: JSON.stringify(data),
    cache: 'no-store',
  });
}

// Helper to get full image URL
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// Transform API product to frontend Product type
export function transformProduct(apiProduct: ApiProduct): import('@/lib/types').Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: Number(apiProduct.basePrice),
    basePrice: Number(apiProduct.basePrice),
    customizationPrice: Number(apiProduct.customizationPrice),
    images: apiProduct.images.map(img => getImageUrl(img)),
    colors: apiProduct.colors.map(c => ({
      id: c.name.toLowerCase().replace(/\s+/g, '-'),
      name: c.name,
      hex: c.hex,
    })),
    sizes: apiProduct.sizes,
    features: apiProduct.features,
    category: apiProduct.category?.slug || '',
    tags: apiProduct.customizable ? ['customizable'] : [],
    inStock: apiProduct.inStock,
    customizable: apiProduct.customizable,
  };
}

// Transform API category to frontend Category type
export function transformCategory(apiCategory: ApiCategory): import('@/lib/types').Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: apiCategory.description || '',
    image: apiCategory.image ? getImageUrl(apiCategory.image) : '',
    featured: true,
    productCount: apiCategory._count?.products,
  };
}

// Get featured products (first 4 products)
export async function getFeaturedProducts(): Promise<import('@/lib/types').Product[]> {
  const { products } = await getProducts({ limit: 4 });
  return products.map(transformProduct);
}

// Get all products transformed to frontend format
export async function getAllProducts(filters?: ProductFilters): Promise<{
  products: import('@/lib/types').Product[];
  pagination: ProductsResponse['pagination'];
}> {
  const response = await getProducts(filters);
  return {
    products: response.products.map(transformProduct),
    pagination: response.pagination,
  };
}

// Get all categories transformed to frontend format
export async function getAllCategories(): Promise<import('@/lib/types').Category[]> {
  const categories = await getCategories();
  return categories.map(transformCategory);
}

// Get a single product by ID transformed to frontend format
export async function getProduct(id: string): Promise<import('@/lib/types').Product> {
  const product = await getProductById(id);
  return transformProduct(product);
}

// Get category by slug transformed to frontend format
export async function getCategory(slug: string): Promise<import('@/lib/types').Category> {
  const category = await getCategoryBySlug(slug);
  return transformCategory(category);
}

// Design Image Upload API
export interface UploadDesignImageData {
  base64: string;
  placement: string;
  productId?: string;
  sessionId: string;
}

export interface UploadDesignImageResponse {
  id: string;
  url: string;
  placement: string;
}

/**
 * Upload a design image to DigitalOcean Spaces
 * Returns the CDN URL for the uploaded image
 */
export async function uploadDesignImage(data: UploadDesignImageData): Promise<UploadDesignImageResponse> {
  return fetchApi<UploadDesignImageResponse>('/upload/design', {
    method: 'POST',
    body: JSON.stringify(data),
    cache: 'no-store',
  });
}
