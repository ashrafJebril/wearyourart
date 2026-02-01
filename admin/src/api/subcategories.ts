import client from './client';
import { Subcategory } from '../types';

export const subcategoriesApi = {
  getAll: async (categoryId?: string): Promise<Subcategory[]> => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await client.get<Subcategory[]>(`/subcategories${params}`);
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Subcategory[]> => {
    const response = await client.get<Subcategory[]>(
      `/subcategories?categoryId=${categoryId}`
    );
    return response.data;
  },

  getOne: async (id: string): Promise<Subcategory> => {
    const response = await client.get<Subcategory>(`/subcategories/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    image?: string;
    categoryId: string;
  }): Promise<Subcategory> => {
    const response = await client.post<Subcategory>('/subcategories', data);
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
      categoryId?: string;
    }
  ): Promise<Subcategory> => {
    const response = await client.patch<Subcategory>(`/subcategories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/subcategories/${id}`);
  },
};
