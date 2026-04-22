import { useQuery } from '@tanstack/react-query'
import { volunteerService } from '@/api/volunteers'
import { queryKeys } from '@/lib/queryKeys'

export function useVolunteers(
  search?: string,
  status?: string,
  skill?: string,
  minReliability?: number,
  page = 1,
  pageSize = 10,
  origin?: { lat: number; lng: number }
) {
  return useQuery({
    queryKey: [...queryKeys.volunteers.all, search, status, skill, minReliability, page, pageSize, origin?.lat, origin?.lng],
    queryFn: () => volunteerService.getAll(search, { status, skill, minReliability, lat: origin?.lat, lng: origin?.lng }, page, pageSize),
    placeholderData: (previousData) => previousData,
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
