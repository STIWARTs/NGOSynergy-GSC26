export const queryKeys = {
  incidents: {
    all: ['incidents'] as const,
    active: ['incidents', 'active'] as const,
    highUrgency: ['incidents', 'highUrgency'] as const,
    stats: ['incidents', 'stats'] as const,
  },
  volunteers: {
    all: ['volunteers'] as const,
    detail: (id: string) => ['volunteers', id] as const,
  },
  digitization: {
    all: ['digitization'] as const,
    queue: ['digitization', 'queue'] as const,
    item: (id: string) => ['digitization', 'item', id] as const,
  },
  verification: {
    all: ['verification'] as const,
    pending: ['verification', 'pending'] as const,
  },
  matching: {
    results: (incidentId: string) => ['matching', incidentId] as const,
  },
  config: {
    weights: ['config', 'weights'] as const,
    multipliers: ['config', 'multipliers'] as const,
  },
}
