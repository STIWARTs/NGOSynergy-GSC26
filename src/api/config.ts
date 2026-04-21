import { AIWeights, UrgencyMultipliers } from '@/types'

export const configService = {
  async saveWeights(_weights: AIWeights): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
  async saveMultipliers(_multipliers: UrgencyMultipliers): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
