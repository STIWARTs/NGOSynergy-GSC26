import { useMemo } from 'react'
import { useAIWeights } from '@/context/AIWeightsContext'
import * as Slider from '@radix-ui/react-slider'
import { useSaveConfig } from '@/hooks/useConfig'
import { emitGlobalToast } from '@/lib/events'

export default function AIConfig() {
  const { weights, multipliers, setWeights, setMultipliers, resetWeights, resetMultipliers } = useAIWeights()
  const saveConfig = useSaveConfig()

  const weightTotal = useMemo(
    () => weights.skillMatch + weights.proximity + weights.availability + weights.reliability,
    [weights]
  )

  const updateWeight = (key: keyof typeof weights, value: number) => {
    setWeights({ ...weights, [key]: value })
  }

  const applyPreset = (preset: 'rapid' | 'expertise' | 'balanced') => {
    if (preset === 'rapid') {
      setWeights({ skillMatch: 0.2, proximity: 0.5, availability: 0.2, reliability: 0.1 })
      return
    }
    if (preset === 'expertise') {
      setWeights({ skillMatch: 0.6, proximity: 0.2, availability: 0.1, reliability: 0.1 })
      return
    }
    resetWeights()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">AI Configuration</h1>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-mono text-text-primary">Matching Weights</h2>

        {(
          [
            ['skillMatch', 'Skill Match'],
            ['proximity', 'Proximity'],
            ['availability', 'Availability'],
            ['reliability', 'Reliability'],
          ] as Array<[keyof typeof weights, string]>
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-primary">{label}</span>
              <span className="text-text-muted">{weights[key].toFixed(2)}</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              min={0}
              max={1}
              step={0.05}
              value={[weights[key]]}
              onValueChange={(value) => updateWeight(key, value[0])}
            >
              <Slider.Track className="bg-base relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-action rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-text-primary rounded-full shadow" />
            </Slider.Root>
          </div>
        ))}

        <p className={`text-sm ${Math.abs(weightTotal - 1) < 0.001 ? 'text-success' : 'text-urgency'}`}>
          Weight total: {weightTotal.toFixed(2)}
        </p>
        <div className="flex gap-2">
          <button onClick={() => applyPreset('rapid')} className="px-3 py-2 text-xs rounded bg-base border border-border">
            Rapid Response
          </button>
          <button onClick={() => applyPreset('expertise')} className="px-3 py-2 text-xs rounded bg-base border border-border">
            Expertise Priority
          </button>
          <button onClick={() => applyPreset('balanced')} className="px-3 py-2 text-xs rounded bg-base border border-border">
            Balanced
          </button>
        </div>
        <button
          onClick={async () => {
            await saveConfig.mutateAsync({ weights, multipliers })
            emitGlobalToast({
              type: 'success',
              title: 'Configuration Saved',
              description: 'PATCH /api/vertex/weights simulated successfully.',
            })
          }}
          className="px-3 py-2 text-sm rounded bg-action text-white"
        >
          Save Configuration
        </button>
        <button onClick={resetWeights} className="px-3 py-2 text-sm rounded bg-base border border-border text-text-primary">
          Reset Weights
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-mono text-text-primary">Urgency Multipliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm text-text-primary">
            Impact
            <input
              type="number"
              step={0.1}
              value={multipliers.impact}
              onChange={(e) => setMultipliers({ ...multipliers, impact: Number(e.target.value) })}
              className="w-full mt-1 bg-base border border-border rounded px-3 py-2 text-text-primary"
            />
          </label>
          <label className="text-sm text-text-primary">
            Severity
            <input
              type="number"
              step={0.1}
              value={multipliers.severity}
              onChange={(e) => setMultipliers({ ...multipliers, severity: Number(e.target.value) })}
              className="w-full mt-1 bg-base border border-border rounded px-3 py-2 text-text-primary"
            />
          </label>
        </div>
        <button
          onClick={resetMultipliers}
          className="px-3 py-2 text-sm rounded bg-base border border-border text-text-primary"
        >
          Reset Multipliers
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-mono text-text-primary">Human-in-the-loop Feedback (30 days)</h2>
        <div className="h-40 border border-border rounded-lg p-3 bg-base">
          <div className="h-full flex items-end gap-1">
            {[62, 66, 64, 70, 68, 72, 75, 71, 74, 73, 72, 76].map((val, idx) => (
              <div key={idx} className="flex-1 bg-success/70 rounded-sm" style={{ height: `${val}%` }} />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>Accepted vs overridden trend over the last 30 days</span>
          <span>Current acceptance: 76%</span>
        </div>
      </div>
    </div>
  )
}
