import client from './client';
import { Category } from '../types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await client.get<Category[]>('/categories');
    return response.data;
  },

  getOne: async (id: string): Promise<Category> => {
    const response = await client.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    image?: string;
  }): Promise<Category> => {
    const response = await client.post<Category>('/categories', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      nameAr?: string;
      description?: string;
      descriptionAr?: string;
      image?: string;
    }
  ): Promise<Category> => {
    const response = await client.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`);
  },
};
