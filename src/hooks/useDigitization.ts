import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { digitizationService } from '@/api/digitization'
import { queryKeys } from '@/lib/queryKeys'
import { DigitizedExtraction } from '@/types'

export function useDigitizationQueue() {
  return useQuery({
    queryKey: queryKeys.digitization.queue,
    queryFn: () => digitizationService.getQueue(),
    staleTime: 10000,
    refetchInterval: 15000,
  })
}

export function useUploadDigitizationFiles(source: 'batch' | 'single') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) => digitizationService.uploadFiles(files, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.digitization.all })
    },
  })
}

export function useDigitizationProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => digitizationService.updateProgress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.digitization.all })
    },
  })
}

export function useApproveDigitization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, extractedData }: { id: string; extractedData: DigitizedExtraction }) =>
      digitizationService.approveAndCommit(id, extractedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.digitization.all })
    },
  })
}

export function useRescanDigitization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => digitizationService.flagForRescan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.digitization.all })
    },
  })
}

export function useDiscardDigitization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => digitizationService.discard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.digitization.all })
    },
  })
}
