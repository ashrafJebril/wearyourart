import client from './client';
import { Product, Pagination, ProductColor } from '../types';

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

interface ProductFilters {
  category?: string;
  inStock?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  basePrice: number;
  customizationPrice?: number;
  images?: string[];
  colors?: ProductColor[];
  sizes?: string[];
  features?: string[];
  categoryId: string;
  inStock?: boolean;
  customizable?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  basePrice?: number;
  customizationPrice?: number;
  images?: string[];
  colors?: ProductColor[];
  sizes?: string[];
  features?: string[];
  categoryId?: string;
  inStock?: boolean;
  customizable?: boolean;
}

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.inStock) params.append('inStock', filters.inStock);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await client.get<ProductsResponse>(
      `/products?${params.toString()}`
    );
    return response.data;
  },

  getOne: async (id: string): Promise<Product> => {
    const response = await client.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await client.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductData): Promise<Product> => {
    const response = await client.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}`);
  },
};
