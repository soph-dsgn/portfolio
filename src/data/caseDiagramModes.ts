export type DiagramMode = 'service-map' | 'filters' | 'route' | 'branch' | 'architecture' | 'convergence' | 'transformation' | 'contrast' | 'status-branch' | 'status-pairs' | 'state-map' | 'entity-map' | 'risk-map' | 'change-list'

// Modes reflect relationships stated in the case, not the number of data items.
const routes = new Set([
  'portal-commission', 'wallet-onboarding', 'wallet-send', 'wallet-receive',
  'wallet-seed', 'wallet-handoff', 'wallet-context',
])
const branches = new Set(['portal-flow'])
export const diagramHubs: Record<string, string> = {
  'portal-map': 'Рабочий кабинет',
  'portal-components': 'Компоненты кабинета',
  'wallet-architecture': 'MVP SkyWallet',
  'wallet-components': 'Дизайн-система SkyWallet',
}
export const stateCenters: Record<string, string> = {
  'portal-states': 'Дашборд',
}
const transformations = new Set([
  'portal-orders-before-after', 'portal-disclosure', 'wallet-send-design',
])
const contrasts = new Set([
  'portal-hierarchy', 'portal-diagnostics', 'wallet-ecosystem', 'wallet-contours',
])

export function diagramModeFor(id: string): DiagramMode | null {
  if (id === 'wallet-states') return 'status-branch'
  if (id === 'wallet-entities') return 'entity-map'
  if (id === 'wallet-risks') return 'risk-map'
  if (id in stateCenters) return 'state-map'
  if (id === 'portal-support') return 'convergence'
  if (branches.has(id)) return 'branch'
  if (routes.has(id)) return 'route'
  if (id in diagramHubs) return 'architecture'
  if (transformations.has(id)) return 'transformation'
  if (contrasts.has(id)) return 'contrast'
  return null
}
