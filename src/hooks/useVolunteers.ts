import { useQuery } from '@tanstack/react-query'
import { volunteerService } from '@/api/volunteers'
import { queryKeys } from '@/lib/queryKeys'

export function useVolunteers(
  search?: string,
  status?: string,
  skill?: string,
  minReliability?: number,
  page = 1,
  pageSize = 10
) {
  return useQuery({
    queryKey: [...queryKeys.volunteers.all, search, status, skill, minReliability, page, pageSize],
    queryFn: () => volunteerService.getAll(search, { status, skill, minReliability }, page, pageSize),
    staleTime: 60000,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useVolunteer(id: string) {
  return useQuery({
    queryKey: queryKeys.volunteers.detail(id),
    queryFn: () => volunteerService.getById(id),
    enabled: !!id,
  })
}
