import client from './client';
import type { ApiResponse, User } from '../types';

export const authApi = {
  register: async (data: { email: string; password: string; name?: string }) => {
    const res = await client.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('trustcart_token', res.data.data.token);
    }
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    if (res.data.data?.token) {
      localStorage.setItem('trustcart_token', res.data.data.token);
    }
    return res.data;
  },

  logout: async () => {
    const res = await client.post<ApiResponse>('/auth/logout');
    localStorage.removeItem('trustcart_token');
    return res.data;
  },

  getProfile: async () => {
    const res = await client.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; password?: string }) => {
    const res = await client.patch<ApiResponse<{ user: User }>>('/auth/me', data);
    return res.data;
  },

  refresh: async () => {
    const res = await client.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (res.data.data?.token) {
      localStorage.setItem('trustcart_token', res.data.data.token);
    }
    return res.data;
  },
};
