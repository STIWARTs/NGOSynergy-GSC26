import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crisesService } from '@/api/crises'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Hook to get all crises prioritized by the Data Digitization Pipeline
 * Returns crises sorted by priorityScore (highest = most urgent)
 */
export function useCrises(limit = 50) {
  return useQuery({
    queryKey: queryKeys.crises.all,
    queryFn: () => crisesService.getAll(limit),
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

/**
 * Hook to get crises filtered by category
 */
export function useCrisesByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.crises.byCategory(category),
    queryFn: () => crisesService.getByCategory(category),
    staleTime: 30000,
  })
}

/**
 * Hook to update a crisis status
 */
export function useUpdateCrisisStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      crisesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crises.all })
    },
  })
}

/**
 * Hook to run a document through the full Data Digitization Pipeline
 * File → OCR → Preprocess → Gemini JSON → Validate → Priority Score → Firestore
 */
export function usePipelineProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (step: string) => void }) =>
      crisesService.processPipelineFile(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crises.all })
    },
  })
}

/**
 * Hook to process raw text through the pipeline (skip OCR)
 */
export function usePipelineProcessText() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => crisesService.processPipelineText(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crises.all })
    },
  })
}
