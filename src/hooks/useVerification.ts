import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/api/verification'
import { queryKeys } from '@/lib/queryKeys'

export function useVerificationQueue() {
  return useQuery({
    queryKey: queryKeys.verification.all,
    queryFn: () => verificationService.getAll(),
    staleTime: 30000,
  })
}

export function useVerifyReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => verificationService.verify(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.verification.all }),
  })
}

export function useRejectReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => verificationService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.verification.all }),
  })
}
