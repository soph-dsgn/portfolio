import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { withoutFinalPeriod } from '../data/caseContent'
import { diagramHubs } from '../data/caseDiagramModes'
import { useLocale } from '../i18n/locale'
import { bindShortWords } from '../lib/typography'
import { ArrowIcon, InlineArrows } from './ArrowIcon'
import { Check } from './ShowcaseCase'
import type { CaseVisualSpec, VisualItem } from '../data/caseVisualTypes'

/* Case diagrams in the home-page vocabulary: a grey card holding white cards, pills and check lists.
   Each visual shape picks a scheme: a pipeline of coloured nodes, a node flow with tabs and connectors,
   a hub tree, a status board, side-by-side cards or a table. The data in caseVisuals.ts stays untouched. */

const text = (value?: string) => value ? <InlineArrows text={withoutFinalPeriod(value)} /> : null

/** Product entities named in the copy read as variable chips, the way they appear in the interface. */
const terms = /(seed-фраз[а-яё]*|seed[- ]phrase|\b(?:Wallet|Account|Network|Asset|fee|QR|API|JSON)\b)/g
const arrows: Record<string, 'right' | 'left' | 'up' | 'down' | 'up-right'> = { '→': 'right', '←': 'left', '↑': 'up', '↓': 'down', '↗': 'up-right' }

function Rich({ value }: { value?: string }) {
  const { t } = useLocale()
  if (!value) return null
  return bindShortWords(t(withoutFinalPeriod(value))).split(terms).map((part, index) => index % 2
    ? <span className="scv-term" key={index}><span aria-hidden="true">#</span>{part}</span>
    : <Fragment key={index}>{part.split(/([→←↑↓↗])/g).map((piece, pieceIndex) => arrows[piece]
      ? <ArrowIcon key={pieceIndex} direction={arrows[piece]} className="arrow-icon--inline" />
      : piece)}</Fragment>)
}

/** Horizontal pipeline of coloured nodes joined by ports; short chains and the "from → what → to" context. */
function Pipeline({ items }: { items: VisualItem[] }) {
  return <ol className="scv-pipe" style={{ '--n': items.length } as CSSProperties}>
    {items.map((item, index) => <li className="scv-pipe-node" key={item.label} data-tint={index === items.length - 1 && items.length > 2 ? 'outline' : index % 4}>
      <strong>{text(item.label)}</strong>
      {item.detail && <span><Rich value={item.detail} /></span>}
    </li>)}
  </ol>
}

/** Connector between nodes: a port, a line and an arrowhead. */
const Link = () => <svg className="scv-link" viewBox="0 0 12 48" aria-hidden="true">
  <circle cx="6" cy="5" r="4" /><path d="M6 9v32" /><path d="m2 38 4 6 4-6" />
</svg>

/** Vertical flow: every step is a tab with its name over a white card; a decision forks into yes / no. */
function NodeFlow({ items }: { items: VisualItem[] }) {
  const { t } = useLocale()
  return <ol className="scv-nodes">
    {items.map((item, index) => <li className="scv-node" key={item.label} data-tint={item.branches ? 'check' : index % 4}>
      {index > 0 && <Link />}
      <span className="scv-node-tag"><span className="scv-node-dot" aria-hidden="true" />{item.branches ? t('Условие') : text(item.label)}</span>
      <span className="scv-node-card">
        {item.branches ? <strong>{text(item.label)}</strong> : <Rich value={item.detail} />}
      </span>
      {item.branches && <span className="scv-fork">
        <span className="scv-fork-way" data-branch="yes"><b>{t('Да')}</b><span>{text(item.branches.yes)}</span></span>
        <span className="scv-fork-way" data-branch="no"><b>{t('Нет')}</b><span>{text(item.branches.no)}</span></span>
      </span>}
    </li>)}
  </ol>
}

/** Hub on top, branches below: the map of a product or a cabinet. */
function Tree({ hub, items }: { hub: string; items: VisualItem[] }) {
  return <div className="scv-tree" style={{ '--n': items.length } as CSSProperties}>
    <span className="scv-tree-hub">{text(hub)}</span>
    <ul className="scv-tree-branches">
      {items.map((item, index) => <li className="scv-card scv-tree-leaf" key={item.label} data-tint={index % 4}>
        <span className="scv-tree-label">{text(item.label)}</span>
        {item.detail && <p><Rich value={item.detail} /></p>}
        {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
      </li>)}
    </ul>
  </div>
}

/** Interface states as a board of status chips: what the user sees and what they can do next. */
const statusOf = (item: VisualItem) => {
  const label = item.label.toLowerCase()
  if (item.tone === 'problem' || label.includes('failed') || label.includes('ошибка')) return 'error'
  if (label.includes('success')) return 'success'
  if (label.includes('pending')) return 'pending'
  return 'idle'
}
function Statuses({ items }: { items: VisualItem[] }) {
  return <ul className="scv-status">
    {items.map(item => <li className="scv-card" key={item.label}>
      <span className="scv-status-chip" data-status={statusOf(item)}><span aria-hidden="true" />{text(item.label)}</span>
      {item.detail && <p>{text(item.detail)}</p>}
      {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
    </li>)}
  </ul>
}

/** Side-by-side cards: the label as a pill (tinted for before / after), the description, the note as a checked line. */
function Sides({ items }: { items: VisualItem[] }) {
  return <ul className="scv-sides">
    {items.map(item => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      <span className="scv-pill">{text(item.label)}</span>
      {item.detail && <p><Rich value={item.detail} /></p>}
      {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
    </li>)}
  </ul>
}

/** Grid of small cards; problems get an orange mark, the note reads as the next step. */
function Grid({ items }: { items: VisualItem[] }) {
  return <ul className={`scv-grid${items.length === 3 ? ' scv-grid--three' : ''}`}>
    {items.map(item => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      {item.tone === 'problem' && <span className="scv-card-index" aria-hidden="true">!</span>}
      <strong>{text(item.label)}</strong>
      {item.detail && <p><Rich value={item.detail} /></p>}
      {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
    </li>)}
  </ul>
}

/** Three-column data: a header of column names, then one white row per item (stacked with labels on phones). */
function Table({ items, columns }: { items: VisualItem[]; columns: string[] }) {
  return <div className="scv-table" role="table">
    <div className="scv-table-head" role="row">{columns.map(column => <span role="columnheader" key={column}>{text(column)}</span>)}</div>
    {items.map(item => <div className="scv-table-row" role="row" key={item.label}>
      <strong role="cell" data-label={columns[0]}>{text(item.label)}</strong>
      <span role="cell" data-label={columns[1]}>{text(item.detail)}</span>
      <span role="cell" data-label={columns[2]}>{text(item.note)}</span>
    </div>)}
  </div>
}

/** Horizontal stepper: dots on one track, the step name and its note under each dot. */
function Stepper({ items }: { items: VisualItem[] }) {
  return <ol className="scv-stepper" style={{ '--n': items.length } as CSSProperties}>
    {items.map((item, index) => <li key={item.label} data-tint={index % 4}>
      <span className="scv-stepper-dot" aria-hidden="true" />
      <strong>{text(item.label)}</strong>
      {item.detail && <span><Rich value={item.detail} /></span>}
    </li>)}
  </ol>
}

/** Summary sheet, the way an operation is checked before it is sent: name on the left, content on the right. */
function Receipt({ items }: { items: VisualItem[] }) {
  return <dl className="scv-receipt">
    {items.map(item => <div key={item.label}>
      <dt>{text(item.label)}</dt>
      <dd><Rich value={item.detail} /></dd>
    </div>)}
  </dl>
}

/** Gates that narrow towards the sensitive action: each level is shorter and darker than the one before. */
function Gates({ items }: { items: VisualItem[] }) {
  return <ol className="scv-gates" style={{ '--n': items.length } as CSSProperties}>
    {items.map((item, index) => <li key={item.label} style={{ '--i': index } as CSSProperties}>
      <strong>{text(item.label)}</strong>
      {item.detail && <span>{text(item.detail)}</span>}
    </li>)}
  </ol>
}

/** Phases on a shared track, each starting as the previous one ends, like a project plan without dates. */
function Track({ items }: { items: VisualItem[] }) {
  return <ol className="scv-track" style={{ '--n': items.length } as CSSProperties}>
    {items.map((item, index) => <li key={item.label} data-tint={index % 4} style={{ '--i': index } as CSSProperties}>
      <strong>{text(item.label)}</strong>
      {item.detail && <span>{text(item.detail)}</span>}
    </li>)}
  </ol>
}

/** Short chains without decisions fit one row of nodes; longer ones become a vertical node flow. */
const fitsPipeline = (items: VisualItem[]) => items.length <= 5 && items.every(item => !item.branches && (item.detail?.length ?? 0) <= 42)
const isStates = (visual: CaseVisualSpec) => visual.presentation === 'states' || visual.id.endsWith('-states')

/** Sequences that would otherwise all read as the same chain get their own scheme. */
const schemes: Record<string, (items: VisualItem[]) => ReactNode> = {
  'wallet-onboarding': items => <Stepper items={items} />,
  'portal-commission': items => <Stepper items={items} />,
  'wallet-context': items => <Receipt items={items} />,
  'wallet-seed': items => <Gates items={items} />,
  'wallet-handoff': items => <Track items={items} />,
}

export function ShowcaseVisual({ visual }: { visual: CaseVisualSpec }) {
  const hub = diagramHubs[visual.id]
  const { items } = visual
  const tree = visual.kind === 'levels' && hub
  const scheme = schemes[visual.id]
  const body = scheme ? scheme(items) : visual.kind === 'flow'
    ? fitsPipeline(items) ? <Pipeline items={items} /> : <NodeFlow items={items} />
    : visual.kind === 'levels'
      ? hub ? <Tree hub={hub} items={items} /> : <Pipeline items={items} />
      : visual.kind === 'comparison'
        ? <Sides items={items} />
        : visual.kind === 'columns' && visual.columns
          ? <Table items={items} columns={visual.columns} />
          : isStates(visual) ? <Statuses items={items} /> : <Grid items={items} />
  return <figure className={`scv scv--${visual.kind}`} data-visual-id={visual.id} aria-labelledby={`${visual.id}-title`}>
    <figcaption className="scv-title" id={`${visual.id}-title`}>
      {text(visual.title)}
      {hub && !tree && <span className="scv-hub">{text(hub)}</span>}
    </figcaption>
    {body}
    {visual.caption && <p className="scv-caption">{text(visual.caption)}</p>}
  </figure>
}
