import { useMutation } from '@tanstack/react-query'
import { configService } from '@/api/config'
import { AIWeights, UrgencyMultipliers } from '@/types'

export function useSaveConfig() {
  return useMutation({
    mutationFn: async ({ weights, multipliers }: { weights: AIWeights; multipliers: UrgencyMultipliers }) => {
      await configService.patchWeights(weights)
      await configService.patchMultipliers(multipliers)
    },
  })
}
