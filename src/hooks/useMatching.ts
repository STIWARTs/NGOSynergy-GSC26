import { useQuery } from '@tanstack/react-query'
import { matchingService } from '@/api/matching'
import { queryKeys } from '@/lib/queryKeys'

export function useMatchResults(incidentId: string) {
  return useQuery({
    queryKey: queryKeys.matching.results(incidentId),
    queryFn: () => matchingService.getResults(),
    enabled: !!incidentId,
    staleTime: 30000,
  })
}
