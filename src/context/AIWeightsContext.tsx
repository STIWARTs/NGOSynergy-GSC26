import { createContext, useContext, useState, ReactNode } from 'react'
import { AIWeights, UrgencyMultipliers } from '@/types'

const DEFAULT_AI_WEIGHTS: AIWeights = {
  skillMatch: 0.4,
  proximity: 0.3,
  availability: 0.2,
  reliability: 0.1,
}

const DEFAULT_URGENCY_MULTIPLIERS: UrgencyMultipliers = {
  impact: 0.6,
  severity: 0.4,
}

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
