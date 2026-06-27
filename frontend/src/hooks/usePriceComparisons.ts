import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../api/analysis.api';

export function usePriceComparisons(analysisId: string) {
  return useQuery({
    queryKey: ['prices', analysisId],
    queryFn: () => analysisApi.getPrices(analysisId),
    enabled: !!analysisId,
    staleTime: 60000,
  });
}
