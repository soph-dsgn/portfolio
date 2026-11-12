import { withoutFinalPeriod } from '../data/caseContent'
import { diagramHubs } from '../data/caseDiagramModes'
import { useLocale } from '../i18n/locale'
import { InlineArrows } from './ArrowIcon'
import { Check } from './ShowcaseCase'
import type { CaseVisualSpec, VisualItem } from './CaseVisual'

/* Case diagrams in the home-page vocabulary: a grey card holding white cards, pills and check lists.
   One renderer per visual shape; the data in caseVisuals.ts stays untouched. */

const text = (value?: string) => value ? <InlineArrows text={withoutFinalPeriod(value)} /> : null
const index = (value: number) => String(value + 1).padStart(2, '0')

/** Yes / no outcome of a decision step. */
function Branches({ branches }: { branches: NonNullable<VisualItem['branches']> }) {
  const { t } = useLocale()
  return <span className="scv-branches">
    <span className="scv-branch" data-branch="yes"><b>{t('Да')}</b> {text(branches.yes)}</span>
    <span className="scv-branch" data-branch="no"><b>{t('Нет')}</b> {text(branches.no)}</span>
  </span>
}

/** Short chains read in one row of equal pills; long ones become a numbered vertical route. */
function Chain({ items, numbered }: { items: VisualItem[]; numbered?: boolean }) {
  const compact = items.length <= 5 && items.every(item => !item.branches && (item.detail?.length ?? 0) <= 42)
  return <ol className={`scv-chain${compact ? '' : ' scv-chain--route'}`}>
    {items.map((item, position) => <li className="scv-chain-step" key={item.label}>
      {(numbered || !compact) && <span className="scv-chain-index" aria-hidden="true">{index(position)}</span>}
      <span className="scv-chain-body">
        <strong>{text(item.label)}</strong>
        {item.detail && <span>{text(item.detail)}</span>}
        {item.branches && <Branches branches={item.branches} />}
      </span>
    </li>)}
  </ol>
}

/** Side-by-side cards: the label as a pill (tinted for before / after), the description, the note as a checked line. */
function Sides({ items }: { items: VisualItem[] }) {
  return <ul className="scv-sides">
    {items.map(item => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      <span className="scv-pill">{text(item.label)}</span>
      {item.detail && <p>{text(item.detail)}</p>}
      {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
    </li>)}
  </ul>
}

/** Grid of small numbered cards; problems get an orange mark, the note reads as the next step. */
function Grid({ items }: { items: VisualItem[] }) {
  return <ul className={`scv-grid${items.length === 3 ? ' scv-grid--three' : ''}`}>
    {items.map((item, position) => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      <span className="scv-card-index" aria-hidden="true">{item.tone === 'problem' ? '!' : index(position)}</span>
      <strong>{text(item.label)}</strong>
      {item.detail && <p>{text(item.detail)}</p>}
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

export function ShowcaseVisual({ visual }: { visual: CaseVisualSpec }) {
  const hub = diagramHubs[visual.id]
  const body = visual.kind === 'flow'
    ? <Chain items={visual.items} numbered={visual.numbered} />
    : visual.kind === 'comparison'
      ? <Sides items={visual.items} />
      : visual.kind === 'columns' && visual.columns
        ? <Table items={visual.items} columns={visual.columns} />
        : <Grid items={visual.items} />
  return <figure className={`scv scv--${visual.kind}`} data-visual-id={visual.id} aria-labelledby={`${visual.id}-title`}>
    <figcaption className="scv-title" id={`${visual.id}-title`}>
      {text(visual.title)}
      {hub && <span className="scv-hub">{text(hub)}</span>}
    </figcaption>
    {body}
    {visual.caption && <p className="scv-caption">{text(visual.caption)}</p>}
  </figure>
}
