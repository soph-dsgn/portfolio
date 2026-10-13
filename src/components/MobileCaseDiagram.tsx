import { motion } from 'framer-motion'
import { useMotionSystem, motionTokens } from '../lib/motion'
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

function VerticalConnector({ visible, reduced, delay }: { visible: boolean; reduced: boolean; delay: number }) {
  return <svg className="case-diagram-mobile-connector" width="16" height="28" viewBox="0 0 16 28" aria-hidden="true">
    <motion.path initial={false} animate={{ pathLength: visible || reduced ? 1 : 0, opacity: visible || reduced ? 1 : 0 }} transition={{ duration: reduced ? motionTokens.reduced : motionTokens.mobile.diagram.connectorDuration, delay: reduced ? 0 : delay, ease: motionTokens.ease }} d="M8 2V24 M5 21L8 24L11 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function MobileCaseDiagram({ visual, mode, visible }: { visual: CaseVisualSpec; mode: DiagramMode; visible: boolean }) {
  const { variants, reduced } = useMotionSystem()
  const groups = mobileGroups(visual, mode).filter(group => group.length)
  return <div className="case-diagram-mobile">
    {groups.map((group, index) => <div className={`case-diagram-mobile-step${mode === 'status-pairs' && index === 2 ? ' case-diagram-mobile-step--separate' : ''}`} key={index}>
      {index > 0 && !(mode === 'status-pairs' && index === 2) && <VerticalConnector visible={visible} reduced={reduced} delay={(index - 1) * motionTokens.mobile.diagram.step + motionTokens.mobile.diagram.connectorStart} />}
      <motion.div className="case-diagram-mobile-group" initial={visible ? false : 'hidden'} animate={visible ? 'visible' : 'hidden'} variants={variants('soft', index * motionTokens.mobile.diagram.step)}>
        {group.map((item, itemIndex) => <div className="case-diagram-mobile-card" key={`${item.label}-${itemIndex}`}>
          <strong><InlineArrows text={withoutFinalPeriod(item.label)} /></strong>
          {item.detail && <p><InlineArrows text={withoutFinalPeriod(item.detail)} /></p>}
          {item.note && <p className="case-diagram-mobile-note"><InlineArrows text={withoutFinalPeriod(item.note)} /></p>}
        </div>)}
      </motion.div>
    </div>)}
  </div>
}
