import client from './client';
import { Admin } from '../types';

interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<Admin> => {
    const response = await client.get<Admin>('/auth/profile');
    return response.data;
  },
};
