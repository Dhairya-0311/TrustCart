import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../api/analysis.api';

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisApi.get(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useAnalysisList(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['analyses', params],
    queryFn: () => analysisApi.list(params),
    staleTime: 10000,
  });
}
