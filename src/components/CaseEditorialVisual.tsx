import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { CaseVisualSpec, MetricMeasure } from './CaseVisual'
import { InlineArrows } from './ArrowIcon'
import { withoutFinalPeriod } from '../data/caseContent'
import { motionTokens, useInterfaceReady } from '../lib/motion'
import '../styles/caseInsights.css'

function Copy({ text }: { text?: string }) { return text ? <InlineArrows text={withoutFinalPeriod(text)} /> : null }
const suffix = (unit: string) => unit === 'points' ? 'п. п.' : unit === 'minutes' ? 'мин' : '%'
const unitLabel = (unit: string, kind: string) => kind === 'completion' ? 'Доля прохождения, %' : unit === 'points' ? 'Изменение в процентных пунктах' : unit === 'minutes' ? 'Время, мин' : kind === 'before-after' ? 'Значение показателя, %' : 'Относительное изменение, %'
const bounds = (m: MetricMeasure): [number, number] => m.kind === 'relative' ? typeof m.value === 'number' ? [m.value,m.value] : m.value : m.kind === 'completion' ? [m.value,m.value] : [m.before,m.after]

function EvidenceChart({ visual }: { visual: CaseVisualSpec }) {
  const ref = useRef<HTMLDivElement>(null)
  const entered = useInView(ref, { once: true, amount: .05 })
  const reduced = useReducedMotion()
  const ready = useInterfaceReady()
  // Evidence kind and unit define the scale: % and pp never share one axis.
  const keys = [...new Set(visual.items.flatMap(item => item.measure ? [`${item.measure.kind}:${'unit' in item.measure ? item.measure.unit : 'percent'}`] : []))]
  return <div className="case-change-chart" ref={ref}>{keys.map(key => {
    const [kind,unit] = key.split(':')
    const items = visual.items.filter(item => item.measure && `${item.measure.kind}:${'unit' in item.measure ? item.measure.unit : 'percent'}` === key)
    const maximum = kind === 'completion' ? 100 : Math.max(...items.flatMap(item => bounds(item.measure!)),1)
    return <section className="case-change-chart-group" key={key} aria-label={unitLabel(unit,kind)}>
      <p className="case-change-chart-label"><Copy text={unitLabel(unit,kind)} /></p>
      <ul className="case-change-chart-rows">{items.map((item,index) => {
        const m = item.measure!
        const [lower,upper] = bounds(m)
        const values = m.kind === 'before-after' ? [m.before,m.after] : [upper]
        return <li key={item.label}>
          <div className="case-change-chart-heading"><span><Copy text={item.label} /></span>
            {m.kind !== 'before-after' && <strong>{m.kind === 'relative' ? m.direction === 'increase' ? '+' : '−' : ''}{lower}{lower !== upper ? `–${upper}` : ''}{unit === 'percent' ? '' : ' '}<Copy text={suffix(unit)} /></strong>}
          </div>
          {values.map((value,i) => <div key={i} className="case-change-chart-bar-row">
            {m.kind === 'before-after' && <span><Copy text={i ? 'После' : 'До'} /></span>}
            <div className="case-change-chart-track" aria-hidden="true">
              <motion.div className="case-change-chart-fill" initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: reduced || (entered && ready) ? 1 : 0 }} style={{ originX: 0 }}
                transition={{ duration: reduced ? 0 : motionTokens.evidence.duration, delay: reduced ? 0 : index * motionTokens.evidence.stagger, ease: motionTokens.ease }}>
                <span className="case-change-chart-solid" style={{ width: `${(m.kind === 'relative' ? lower : value) / maximum * 100}%` }} />
                {m.kind === 'relative' && lower !== upper && <span className="case-change-chart-range" style={{ left: `${lower / maximum * 100}%`, width: `${(upper-lower) / maximum * 100}%` }} />}
              </motion.div>
            </div>
            {m.kind === 'before-after' && <strong>{value}<Copy text={suffix(unit)} /></strong>}
          </div>)}
          <p><Copy text={item.detail} /></p>
        </li>
      })}</ul>
      <div className="case-change-chart-axis" aria-hidden="true"><span>0</span><span>{maximum} <Copy text={suffix(unit)} /></span></div>
      <p className="case-change-chart-legend"><Copy text={kind === 'relative' ? unit === 'points' ? 'Разница в процентных пунктах, не относительный рост' : 'Изменение относительно исходного показателя, не доля пользователей' : kind === 'completion' ? 'Шкала — 100% одной и той же аудитории' : 'До и после показаны на общей шкале'} /></p>
      {items.some(item => { const [a,b] = bounds(item.measure!); return item.measure?.kind === 'relative' && a !== b }) && <p className="case-change-chart-legend">Светлый участок — указанный диапазон изменения</p>}
    </section>
  })}{visual.items.filter(item => !item.measure).map(item => <p className="case-evidence-statement" key={item.label}><Copy text={item.label} /><Copy text={item.detail} /></p>)}</div>
}

/** Business copy is configuration data; this component only defines presentation. */
export function CaseEditorialVisual({ visual }: { visual: CaseVisualSpec }) {
  if (visual.presentation === 'changes') return <EvidenceChart visual={visual} />
  if (visual.presentation === 'steps') return <ol className="case-editorial-steps">{visual.items.map((item,index) => <li key={item.label}>
    <span className="case-insight-step-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
    <strong><Copy text={item.label} /></strong><p><Copy text={item.detail} /></p>{item.note && <small><Copy text={item.note} /></small>}
  </li>)}</ol>
  if (['friction','options','impact'].includes(visual.presentation ?? '')) return <dl className={`case-editorial-ledger case-editorial-ledger--${visual.presentation}`}>
    {visual.items.map((item,index) => <div key={item.label} className={item.tone ? `case-tone--${item.tone}` : undefined}>
      <dt><span className="case-insight-step-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Copy text={item.label} /></dt>
      <dd><Copy text={item.detail} /></dd>{item.note && <dd className="case-editorial-ledger-note"><Copy text={item.note} /></dd>}
    </div>)}
  </dl>
  if (['insights','risks','states'].includes(visual.presentation ?? '')) return <dl className={`case-insight-notes case-insight-notes--${visual.presentation}`}>
    {visual.items.map((item,index) => <div key={item.label} className={`case-tone--${item.tone ?? 'neutral'}`}>
      <dt>{visual.presentation === 'insights' ? <span className="case-insight-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span> : <span className="case-insight-marker" aria-hidden="true" />}<Copy text={item.label} /></dt>
      <dd><Copy text={item.detail} /></dd>{item.note && <dd className="case-insight-benefit"><Copy text={item.note} /></dd>}
    </div>)}
  </dl>
  if (visual.presentation === 'before-after' || visual.presentation === 'comparison') return <dl className="case-insight-pair">
    {visual.items.map(item => <div className={`case-insight-card case-tone--${item.tone ?? 'neutral'}`} key={item.label}>
      <dt><span className="case-insight-marker" aria-hidden="true" /><Copy text={item.label} /></dt>
      <dd><Copy text={item.detail} /></dd>{item.note && <dd className="case-insight-benefit"><Copy text={item.note} /></dd>}
    </div>)}
  </dl>
  const opportunity = visual.presentation === 'opportunity'
  const problemTone = visual.pairTones?.problem ?? 'neutral'
  return <div className="case-insight-pairs">{visual.items.map(item => <section className="case-insight-row" key={item.label}>
    {!opportunity && <h4><Copy text={item.label} /></h4>}
    <dl className="case-insight-pair">
      <div className={`case-insight-card case-tone--${problemTone}`}><dt><span className="case-insight-marker" aria-hidden="true" />Проблема</dt><dd><Copy text={opportunity ? item.label : item.detail} /></dd></div>
      <div className={`case-insight-card case-tone--${item.tone ?? visual.pairTones?.response ?? 'neutral'}`}>
        <dt><span className="case-insight-marker" aria-hidden="true" />{(item.tone ?? visual.pairTones?.response) === 'hypothesis' ? 'Гипотеза' : 'Решение'}</dt>
        <dd><Copy text={opportunity ? item.detail : item.note} /></dd>{opportunity && item.note && <dd className="case-insight-benefit"><Copy text={item.note} /></dd>}
      </div>
    </dl>
  </section>)}</div>
}
