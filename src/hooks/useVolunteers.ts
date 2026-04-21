import { useQuery } from '@tanstack/react-query'
import { volunteerService } from '@/api/volunteers'
import { queryKeys } from '@/lib/queryKeys'

export function useVolunteers(search?: string, filters?: any) {
  return useQuery({
    queryKey: [...queryKeys.volunteers.all, search, filters],
    queryFn: () => volunteerService.getAll(search, filters),
    staleTime: 30000,
  })
}

export function useVolunteer(id: string) {
  return useQuery({
    queryKey: queryKeys.volunteers.detail(id),
    queryFn: () => volunteerService.getById(id),
    enabled: !!id,
  })
}
