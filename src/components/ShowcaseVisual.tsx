import { Fragment } from 'react'
import { withoutFinalPeriod } from '../data/caseContent'
import { InlineArrows } from './ArrowIcon'
import { Check } from './ShowcaseCase'
import type { CaseVisualSpec, VisualItem } from './CaseVisual'

/* Case diagrams in the home-page vocabulary: a grey card holding white cards, pills and check lists.
   One renderer per visual shape; the data in caseVisuals.ts stays untouched. */

const text = (value?: string) => value ? <InlineArrows text={withoutFinalPeriod(value)} /> : null

/** Ordered chain: white pills joined by arrows, each with a short explanation under the label. */
function Chain({ items, numbered }: { items: VisualItem[]; numbered?: boolean }) {
  return <ol className="scv-chain">
    {items.map((item, index) => <Fragment key={item.label}>
      <li className="scv-chain-step">
        {numbered && <span className="scv-chain-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
        <strong>{text(item.label)}</strong>
        {item.detail && <span>{text(item.detail)}</span>}
      </li>
    </Fragment>)}
  </ol>
}

/** Side-by-side cards: the label as a pill, the description, then the note as a checked line. */
function Sides({ items }: { items: VisualItem[] }) {
  return <ul className="scv-sides">
    {items.map(item => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      <span className="scv-pill">{text(item.label)}</span>
      {item.detail && <p>{text(item.detail)}</p>}
      {item.note && <p className="scv-check"><Check />{text(item.note)}</p>}
    </li>)}
  </ul>
}

/** Grid of small cards: what can go wrong (tone problem) or parallel items. */
function Grid({ items }: { items: VisualItem[] }) {
  return <ul className="scv-grid">
    {items.map((item, index) => <li className="scv-card" key={item.label} data-tone={item.tone ?? 'neutral'}>
      <span className="scv-card-index" aria-hidden="true">{item.tone === 'problem' ? '!' : String(index + 1).padStart(2, '0')}</span>
      <strong>{text(item.label)}</strong>
      {item.detail && <p>{text(item.detail)}</p>}
      {item.note && <p className="scv-muted">{text(item.note)}</p>}
    </li>)}
  </ul>
}

export function ShowcaseVisual({ visual }: { visual: CaseVisualSpec }) {
  const body = visual.kind === 'flow'
    ? <Chain items={visual.items} numbered={visual.numbered} />
    : visual.kind === 'comparison'
      ? <Sides items={visual.items} />
      : <Grid items={visual.items} />
  return <figure className={`scv scv--${visual.kind}`} data-visual-id={visual.id} aria-labelledby={`${visual.id}-title`}>
    <figcaption className="scv-title" id={`${visual.id}-title`}>{text(visual.title)}</figcaption>
    {body}
    {visual.caption && <p className="scv-caption">{text(visual.caption)}</p>}
  </figure>
}
