import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../api/analysis.api';
import type { AnalysisStatusResponse } from '../types';

export function useAnalysisStatus(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['analysis-status', id],
    queryFn: async () => {
      const res = await analysisApi.getStatus(id);
      return res.data as AnalysisStatusResponse;
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when completed or failed
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    staleTime: 1000,
  });
}
