import { createContext, useContext, useState, ReactNode } from 'react'
import { AIWeights, UrgencyMultipliers } from '@/types'
import { DEFAULT_AI_WEIGHTS, DEFAULT_URGENCY_MULTIPLIERS } from '@/lib/mockData'

interface AIWeightsContextType {
  weights: AIWeights
  multipliers: UrgencyMultipliers
  setWeights: (weights: AIWeights) => void
  setMultipliers: (multipliers: UrgencyMultipliers) => void
  resetWeights: () => void
  resetMultipliers: () => void
}

const AIWeightsContext = createContext<AIWeightsContextType | undefined>(undefined)

export function AIWeightsProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<AIWeights>(DEFAULT_AI_WEIGHTS)
  const [multipliers, setMultipliers] = useState<UrgencyMultipliers>(DEFAULT_URGENCY_MULTIPLIERS)

  const resetWeights = () => setWeights(DEFAULT_AI_WEIGHTS)
  const resetMultipliers = () => setMultipliers(DEFAULT_URGENCY_MULTIPLIERS)

  return (
    <AIWeightsContext.Provider value={{ weights, multipliers, setWeights, setMultipliers, resetWeights, resetMultipliers }}>
      {children}
    </AIWeightsContext.Provider>
  )
}

export function useAIWeights() {
  const context = useContext(AIWeightsContext)
  if (!context) {
    throw new Error('useAIWeights must be used within AIWeightsProvider')
  }
  return context
}
