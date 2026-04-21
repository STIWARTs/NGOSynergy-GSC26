import { useQuery } from '@tanstack/react-query'
import { incidentService } from '@/api/incidents'
import { queryKeys } from '@/lib/queryKeys'

export function useIncidents() {
  return useQuery({
    queryKey: queryKeys.incidents.all,
    queryFn: () => incidentService.getAll(),
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export function useActiveIncidents() {
  return useQuery({
    queryKey: queryKeys.incidents.active,
    queryFn: () => incidentService.getActive(),
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export function useIncidentStats() {
  return useQuery({
    queryKey: queryKeys.incidents.stats,
    queryFn: () => incidentService.getStats(),
    staleTime: 30000,
    refetchInterval: 30000,
  })
}
