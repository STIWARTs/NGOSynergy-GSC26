import { useMutation, useQuery } from '@tanstack/react-query'
import { matchingService } from '@/api/matching'
import { queryKeys } from '@/lib/queryKeys'
import { AIWeights } from '@/types'

export function useMatchResults(incidentId: string, weights: AIWeights) {
  return useQuery({
    queryKey: [...queryKeys.matching.results(incidentId), weights],
    queryFn: () => matchingService.getResults({ incidentId, weights }),
    enabled: !!incidentId,
    staleTime: 30000,
  })
}

export function useDeployMatch() {
  return useMutation({
    mutationFn: ({ incidentId, volunteerId }: { incidentId: string; volunteerId: string }) =>
      matchingService.deployVolunteer({ incidentId, volunteerId }),
  })
}
