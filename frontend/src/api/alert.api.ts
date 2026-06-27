import client from './client';
import type { ApiResponse, PriceAlert } from '../types';

export const alertApi = {
  create: async (data: { product_url: string; platform?: string; target_price: number }) => {
    const res = await client.post<ApiResponse<{ alert: PriceAlert }>>('/alerts', data);
    return res.data;
  },

  list: async () => {
    const res = await client.get<ApiResponse<{ alerts: PriceAlert[] }>>('/alerts');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await client.delete<ApiResponse>(`/alerts/${id}`);
    return res.data;
  },
};
