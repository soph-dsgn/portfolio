import { useMotionSystem } from '../lib/motion'
import { motion } from 'framer-motion'
import { InlineArrows } from './ArrowIcon'
import { Icon } from './Icon'
import { withoutFinalPeriod } from '../data/caseContent'
import { CaseDiagram } from './CaseDiagram'
import { diagramModeFor } from '../data/caseDiagramModes'
import { CaseEditorialVisual } from './CaseEditorialVisual'
import '../styles/caseVisualTokens.css'

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

const equivalentHeadings: Record<string, string> = {
  'wallet-context': 'Постоянный активный контекст',
  'wallet-errors': 'Предупреждение ошибок до подтверждения',
  'wallet-states': 'Статусы операций',
  'astoria-entry': 'Разные точки входа',
  'health-states': 'Системные состояния',
  'atlyx-statuses': 'Понятная модель статусов',
}

function repeatsHeading(title: string, heading: string, id: string) {
  const normalize = (text: string) => text.toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return normalize(title) === normalize(heading) ||
    (Boolean(equivalentHeadings[id]) && normalize(equivalentHeadings[id]) === normalize(heading))
}

export function CaseVisual({ visual, precedingHeading = '' }: { visual: CaseVisualSpec; precedingHeading?: string }) {
  const { reveal, variants } = useMotionSystem()
  const showHeading = !repeatsHeading(visual.title, precedingHeading, visual.id)
  const diagramMode = diagramModeFor(visual.id)
  const isDiagram = Boolean(diagramMode && !visual.presentation)
  const isTable = visual.kind === 'columns' && visual.columns && !diagramMode

  return (
    <motion.figure className={`case-visual case-visual--${visual.kind}${showHeading ? '' : ' case-visual--untitled'}`}
      data-visual-id={visual.id} data-presentation={visual.presentation ?? 'diagram'}
      {...(isDiagram || visual.presentation === 'changes' ? { initial: false as const } : reveal(visual.kind === 'comparison' ? 'right' : visual.kind === 'flow' ? 'left' : 'scale', .08))}
      aria-labelledby={showHeading ? `${visual.id}-title` : undefined}
      aria-label={showHeading ? undefined : visual.title}>
      {showHeading ? (
        <figcaption className="case-visual-heading" id={`${visual.id}-title`}>
          <span className="case-visual-index" aria-hidden="true"><Icon name="grid" /></span>
          <span><InlineArrows text={visual.title} /></span>
        </figcaption>
      ) : null}
      {visual.presentation && visual.presentation !== 'results' ? (
        <CaseEditorialVisual visual={visual} />
      ) : isTable ? (
        <div className="case-visual-table-wrap">
          <table className="case-visual-table">
            <thead><tr>{visual.columns?.map((column) => <th scope="col" key={column}><InlineArrows text={column} /></th>)}</tr></thead>
            <tbody>{visual.items.map((item) => (
              <tr key={item.label}>
                <th scope="row" data-label={visual.columns?.[0]}><InlineArrows text={item.label} /></th>
                <td data-label={visual.columns?.[1]}>{item.detail && <InlineArrows text={withoutFinalPeriod(item.detail)} />}</td>
                <td data-label={visual.columns?.[2]}>{item.note && <InlineArrows text={withoutFinalPeriod(item.note)} />}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : diagramMode ? (
        <CaseDiagram visual={visual} mode={diagramMode} />
      ) : visual.presentation === 'results' ? (
        <motion.ul className="case-visual-results case-metric-grid"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: .05 }}>
          {visual.items.map((item, index) => (
            <motion.li key={`${item.label}-${index}`}
              variants={variants('scale', index * .05)}>
              {item.detail && <motion.strong variants={variants('fade', index * .05)}><InlineArrows text={withoutFinalPeriod(item.detail)} /></motion.strong>}
              <motion.span variants={variants('fade', .1 + index * .05)}><InlineArrows text={item.label} /></motion.span>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <dl className="case-visual-plain">{visual.items.map((item) => <div key={item.label}>
          <dt><InlineArrows text={item.label} /></dt>
          <dd>{item.detail && <InlineArrows text={withoutFinalPeriod(item.detail)} />}</dd>
        </div>)}</dl>
      )}
      {visual.caption && <p className="case-visual-caption"><InlineArrows text={withoutFinalPeriod(visual.caption)} /></p>}
    </motion.figure>
  )
}
