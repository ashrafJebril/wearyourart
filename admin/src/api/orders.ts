import client from './client';
import { Order, OrderStats, OrderStatus, Pagination } from '../types';

interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await client.get<OrdersResponse>(
      `/orders?${params.toString()}`
    );
    return response.data;
  },

  getOne: async (id: string): Promise<Order> => {
    const response = await client.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getStats: async (): Promise<OrderStats> => {
    const response = await client.get<OrderStats>('/orders/stats');
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await client.patch<Order>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};
