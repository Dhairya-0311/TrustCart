import client from './client';
import type { ApiResponse, Analysis, AnalysisStatusResponse, ReviewAnalysis, PriceComparison, PaginationMeta } from '../types';

export const analysisApi = {
  create: async (url: string) => {
    const res = await client.post<ApiResponse<{ analysis_id: string; job_id: string; status: string }>>('/analyses', { url });
    return res.data;
  },

  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await client.get<ApiResponse<Analysis[]> & { meta: PaginationMeta }>('/analyses', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await client.get<ApiResponse<{ analysis: Analysis }>>(`/analyses/${id}`);
    return res.data;
  },

  getStatus: async (id: string) => {
    const res = await client.get<ApiResponse<AnalysisStatusResponse>>(`/analyses/${id}/status`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await client.delete<ApiResponse>(`/analyses/${id}`);
    return res.data;
  },

  getReviews: async (id: string) => {
    const res = await client.get<ApiResponse<{ reviews: ReviewAnalysis[]; stats: ReviewAnalysis | null }>>(`/analyses/${id}/reviews`);
    return res.data;
  },

  getPrices: async (id: string) => {
    const res = await client.get<ApiResponse<{ comparisons: PriceComparison[] }>>(`/analyses/${id}/prices`);
    return res.data;
  },
};
