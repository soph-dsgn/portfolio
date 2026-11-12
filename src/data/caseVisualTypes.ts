/* Shape of the case diagrams described in caseVisuals.ts. */

export type MetricMeasure =
  | { kind: 'relative'; value: number | [number, number]; unit: 'percent' | 'points'; direction: 'increase' | 'decrease' }
  | { kind: 'completion'; value: number }
  | { kind: 'before-after'; before: number; after: number; unit: 'percent' | 'points' | 'minutes' }
export type VisualItem = {
  label: string; detail?: string; note?: string; branches?: { yes: string; no: string }
  tone?: 'problem' | 'solution' | 'hypothesis' | 'neutral'
  measure?: MetricMeasure
}

export type CaseVisualSpec = {
  id: string
  group: string
  after: string
  title: string
  caption?: string
  kind: 'columns' | 'flow' | 'matrix' | 'comparison' | 'levels'
  numbered?: boolean
  columns?: string[]
  presentation?: 'results' | 'problem-solution' | 'opportunity' | 'before-after' | 'insights' | 'changes' | 'comparison' | 'risks' | 'friction' | 'options' | 'impact' | 'steps' | 'states'
  pairTones?: { problem: 'problem' | 'neutral'; response: 'solution' | 'hypothesis' | 'neutral' }
  items: VisualItem[]
}
