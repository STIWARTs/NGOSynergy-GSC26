import { AIWeights, UrgencyMultipliers } from '@/types'

export const configService = {
  async patchWeights(_weights: AIWeights): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  async patchMultipliers(_multipliers: UrgencyMultipliers): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
