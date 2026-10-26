import type { CaseVisualSpec, VisualItem } from './CaseVisual'
import { diagramHubs, stateCenters, type DiagramMode } from '../data/caseDiagramModes'
import { withoutFinalPeriod } from '../data/caseContent'
import { InlineArrows } from './ArrowIcon'

const convergenceLabels: Record<string, string> = {
  'portal-support': 'Поддержка', 'astoria-intents': 'Подходящий тур',
  'astoria-problem': 'Путь выбора и оформления', 'astoria-entry': 'Выдача туров',
}

/** Parallel alternatives stay grouped; only neighbouring groups are connected. */
function mobileGroups(visual: CaseVisualSpec, mode: DiagramMode): VisualItem[][] {
  const items = visual.items
  if (mode === 'architecture') {
    const label = diagramHubs[visual.id]
    const root = items.find(item => item.label === label) ?? { label }
    const groups = [[root], items.filter(item => item !== root && item.label !== label)]
    if (visual.id === 'astoria-cms') groups.push([{ label: 'Витрина' }])
    return groups
  }
  if (mode === 'state-map') return [[{ label: stateCenters[visual.id], detail: 'Варианты состояния' }], items]
  if (mode === 'convergence') return [items, [{ label: convergenceLabels[visual.id] ?? 'Выдача туров' }]]
  if (mode === 'service-map') return [[items[0], items[2]], [items[1]], [items[3]], [items[4]]]
  if (mode === 'branch' && visual.id === 'portal-flow') {
    const decision = items[3]
    return [...items.slice(0, 3).map(item => [item]), [decision], [
      { label: `Да — ${decision.branches?.yes ?? ''}` },
      { label: `Нет — ${decision.branches?.no ?? ''}`, detail: items[4].detail },
    ]]
  }
  if (mode === 'branch' && visual.id === 'atlyx-flight-flow') return [[items[0]], [items[1], items[2]], [items[3]]]
  if (mode === 'branch') return [[items[0]], items.slice(1)]
  if (mode === 'status-branch') return [[items[0]], items.slice(1, 3), [{ label: 'История операций' }, ...items.slice(3)]]
  if (mode === 'contrast' || mode === 'risk-map' || mode === 'change-list') return [items]
  return items.map(item => [item])
}

function VerticalConnector() {
  return <svg className="case-diagram-mobile-connector" width="16" height="28" viewBox="0 0 16 28" aria-hidden="true">
    <path d="M8 2V24 M5 21L8 24L11 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function MobileCaseDiagram({ visual, mode }: { visual: CaseVisualSpec; mode: DiagramMode }) {
  const groups = mobileGroups(visual, mode).filter(group => group.length)
  const dominantIndex = mode === 'branch'
    ? visual.id === 'portal-flow' ? 3 : 0
    : mode === 'architecture' || mode === 'state-map' || mode === 'status-branch' ? 0 : -1
  return <div className={`case-diagram-mobile case-diagram-mobile--${mode}`}>
    {groups.map((group, index) => <div className={`case-diagram-mobile-step${mode === 'status-pairs' && index === 2 ? ' case-diagram-mobile-step--separate' : ''}${index === dominantIndex ? ' case-diagram-mobile-step--dominant' : ''}`} key={index}>
      {index > 0 && !(mode === 'status-pairs' && index === 2) && <VerticalConnector />}
      <div className="case-diagram-mobile-group">
        {group.map((item, itemIndex) => <div className="case-diagram-mobile-card" key={`${item.label}-${itemIndex}`}>
          <strong><InlineArrows text={withoutFinalPeriod(item.label)} /></strong>
          {item.detail && <p><InlineArrows text={withoutFinalPeriod(item.detail)} /></p>}
          {item.note && <p className="case-diagram-mobile-note"><InlineArrows text={withoutFinalPeriod(item.note)} /></p>}
        </div>)}
      </div>
    </div>)}
  </div>
}
