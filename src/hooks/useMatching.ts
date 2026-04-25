import { useMutation, useQuery } from '@tanstack/react-query'
import { matchingService } from '@/api/matching'
import { queryKeys } from '@/lib/queryKeys'
import { AIWeights } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

export function useMatchResults(
  incidentId: string,
  weights: AIWeights,
  options?: { radiusKm?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...queryKeys.matching.results(incidentId), weights, options?.radiusKm, options?.limit],
    queryFn: () => matchingService.getResults({ incidentId, weights, radiusKm: options?.radiusKm, limit: options?.limit }),
    enabled: !!incidentId,
    staleTime: 30000,
  })
}

export function useDeployMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ incidentId, volunteerId }: { incidentId: string; volunteerId: string }) =>
      matchingService.deployVolunteer({ incidentId, volunteerId }),
    onSuccess: () => {
      // Keep dashboard and matching views in sync right after assignment.
      queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.stats })
    },
  })
}
