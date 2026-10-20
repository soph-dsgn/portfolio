import { useEntrance } from '../lib/useEntrance'
import { useMotionSystem } from '../lib/motion'
import { motionTokens } from '../lib/motion'
import { useMemo, useRef, useState, useCallback, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { CaseVisualSpec, VisualItem } from './CaseVisual'
import { InlineArrows } from './ArrowIcon'
import { withoutFinalPeriod } from '../data/caseContent'
import { diagramHubs, stateCenters, type DiagramMode } from '../data/caseDiagramModes'
import { DiagramWires, type DiagramEdge } from './DiagramWires'
import { MobileCaseDiagram } from './MobileCaseDiagram'
import { bindShortWords } from '../lib/typography'
import { DiagramSequence, DiagramSequenceNode } from './DiagramSequence'

function DiagramNode({ item, index, number, tone, subtitle }: {
  item: VisualItem; index: number;
  number?: boolean; tone?: 'primary' | 'soft'; subtitle?: string
}) {
  return <DiagramSequenceNode id={`node-${index}`} index={index} className={`case-diagram-node${tone ? ` case-diagram-node--${tone}` : ''}`}>
    {number && <span className="case-diagram-number">{String(index + 1).padStart(2, '0')}</span>}
    <strong><InlineArrows text={item.label} /></strong>
    {subtitle && <small>{bindShortWords(withoutFinalPeriod(subtitle))}</small>}
  </DiagramSequenceNode>
}

function Explanation({ items }: { items: VisualItem[] }) {
  return <dl className="case-diagram-explanations">
    {items.map((item, index) => <div key={`${item.label}-${index}`}>
      <dt><InlineArrows text={item.label} /></dt>
      <dd>{item.detail && <InlineArrows text={withoutFinalPeriod(item.detail)} />}{item.note && <span className="case-diagram-note"><InlineArrows text={withoutFinalPeriod(item.note)} /></span>}</dd>
    </div>)}
  </dl>
}

function ServiceMap({ items }: { items: VisualItem[] }) {
  // Both the home search and the direction page are confirmed entry points to one result set.
  const [home, results, direction, tour, checkout] = items
  return <>
    <div className="case-diagram-service-map" aria-label="Главная и страница направления ведут к выдаче, затем к туру и оформлению">
      <div className="case-diagram-entry-points">
        <DiagramNode item={home} index={0} subtitle="Поиск и подборки" />
        <DiagramNode item={direction} index={1} subtitle="Страна или курорт" />
      </div>
      <DiagramNode item={results} index={2} tone="primary" />
      <DiagramNode item={tour} index={3} />
      <DiagramNode item={checkout} index={4} />
    </div>
    <Explanation items={[home, direction, results, tour, checkout]} />
  </>
}

function FilterStates({ items }: { items: VisualItem[] }) {
  const [basic, advanced, selected] = items
  return <>
    <div className="case-diagram-filter" aria-label="Основные фильтры, раскрываемые дополнительные настройки и выбранные фильтры над выдачей">
      <DiagramSequenceNode id="filter-controls" className="case-diagram-filter-controls">
        <span className="case-diagram-overline">{basic.label}</span>
        <div className="case-diagram-filter-pills" aria-hidden="true">
          <span className="case-diagram-filter-active">Цена</span>
          <span>Даты</span><span>Питание</span><span>Звёзды</span><span>Расположение</span><span>Продолжительность</span>
        </div>
        <div className="case-diagram-filter-more">
          <span className="case-diagram-overline">{advanced.label}</span>
          <div className="case-diagram-filter-expanded">
            <span className="case-diagram-setting-line" /><span className="case-diagram-setting-line" /><span className="case-diagram-setting-line" />
          </div>
        </div>
      </DiagramSequenceNode>
      <DiagramSequenceNode id="filter-results" className="case-diagram-filter-results">
        <span className="case-diagram-overline">Выдача</span>
        <span className="case-diagram-filter-selected-label">{selected.label}</span>
        <div className="case-diagram-filter-selected">
          <span>Цена <b aria-hidden="true">×</b></span><span>Даты <b aria-hidden="true">×</b></span>
        </div>
        <div className="case-diagram-result-lines" aria-hidden="true"><i /><i /><i /></div>
      </DiagramSequenceNode>
    </div>
    <Explanation items={items} />
  </>
}

function Route({ visual }: { visual: CaseVisualSpec }) {
  return <>
    <ol className="case-diagram-route">
      {visual.items.map((item, index) => <li key={`${item.label}-${index}`}>
        <DiagramNode item={item} index={index} number={visual.numbered} tone={index === visual.items.length - 1 ? 'primary' : undefined} />
      </li>)}
    </ol>
    <Explanation items={visual.items} />
  </>
}

function Branch({ visual }: { visual: CaseVisualSpec }) {
  if (visual.id === 'portal-flow') {
    const lead = visual.items.slice(0, 3)
    const decision = visual.items[3]
    const diagnosis = visual.items[4]
    return <>
      <div className="case-diagram-branch-lead">{lead.map((item, index) => <div key={item.label} className="case-diagram-branch-step">
        <DiagramNode item={item} index={index} number />
      </div>)}</div>
      <div className="case-diagram-decision"><DiagramNode item={decision} index={3} tone="primary" /></div>
      <div className="case-diagram-branches">
        <DiagramSequenceNode id="yes" index={0}><span className="case-diagram-branch-label">Да</span><strong>{decision.branches?.yes && bindShortWords(decision.branches.yes)}</strong></DiagramSequenceNode>
        <DiagramSequenceNode id="no" index={1}><span className="case-diagram-branch-label">Нет</span><strong>{decision.branches?.no && bindShortWords(decision.branches.no)}</strong><p><InlineArrows text={withoutFinalPeriod(diagnosis.detail ?? '')} /></p></DiagramSequenceNode>
      </div>
      <Explanation items={lead} />
    </>
  }
  if (visual.id === 'atlyx-flight-flow') {
    const [search, found, missing, save] = visual.items
    return <>
      <div className="case-diagram-decision"><DiagramNode item={search} index={0} tone="primary" /></div>
      <div className="case-diagram-branches"><div><span className="case-diagram-branch-label">Да</span><DiagramNode item={found} index={1} /></div>
        <div><span className="case-diagram-branch-label">Нет</span><DiagramNode item={missing} index={2} /></div></div>
      <div className="case-diagram-branch-end"><DiagramNode item={save} index={3} tone="primary" /></div>
      <Explanation items={visual.items} />
    </>
  }
  const [opening, ...outcomes] = visual.items
  return <>
    <div className="case-diagram-decision"><DiagramNode item={opening} index={0} tone="primary" /></div>
    <div className="case-diagram-branches case-diagram-branches--three">{outcomes.map((item, index) => <div key={item.label}>
      <DiagramNode item={item} index={index + 1} />
    </div>)}</div>
    <Explanation items={visual.items} />
  </>
}

function Architecture({ visual }: { visual: CaseVisualSpec }) {
  const center = diagramHubs[visual.id]
  const branches = visual.items.filter((item) => item.label !== center)
  const centerItem = visual.items.find((item) => item.label === center)
  return <>
    <div className="case-diagram-architecture">
      <DiagramSequenceNode id="hub" className="case-diagram-hub"><strong>{bindShortWords(center)}</strong>{centerItem?.detail && <small>{centerItem.detail && bindShortWords(withoutFinalPeriod(centerItem.detail))}</small>}</DiagramSequenceNode>
      <div className="case-diagram-hub-nodes">{branches.map((item, index) => <DiagramNode key={item.label} item={item} index={index} />)}</div>
    </div>
    {visual.id === 'astoria-cms' && <div className="case-diagram-architecture-end"><DiagramSequenceNode id="end" as="strong">Витрина</DiagramSequenceNode></div>}
    <Explanation items={visual.items} />
  </>
}

function Convergence({ items, center }: { items: VisualItem[]; center: string }) {
  return <>
    <div className="case-diagram-convergence">
      <div className="case-diagram-convergence-entries">{items.map((item, index) => <DiagramNode key={item.label} item={item} index={index} />)}</div>
      <DiagramSequenceNode id="hub" className="case-diagram-hub"><strong>{bindShortWords(center)}</strong></DiagramSequenceNode>
    </div>
    <Explanation items={items} />
  </>
}

function Paired({ visual, transformation }: { visual: CaseVisualSpec; transformation: boolean }) {
  const [first, second] = visual.items
  return <>
    <div className={`case-diagram-paired${transformation ? ' case-diagram-paired--change' : ''}`}>
      <DiagramNode item={first} index={0} />
      <DiagramNode item={second} index={1} tone={transformation ? 'primary' : undefined} />
    </div>
    <Explanation items={visual.items} />
  </>
}

function StatusBranch({ items }: { items: VisualItem[] }) {
  const [pending, success, failed, history] = items
  return <>
    <div className="case-diagram-decision"><DiagramNode item={pending} index={0} tone="primary" /></div>
    <div className="case-diagram-branches">{[success, failed].map((item, index) => <div key={item.label}>
      <DiagramNode item={item} index={index + 1} />
    </div>)}</div>
    <div className="case-diagram-status-aside"><span>История операций</span><DiagramNode item={history} index={3} /></div>
    <Explanation items={items} />
  </>
}

function StatusPairs({ items }: { items: VisualItem[] }) {
  return <>
    <div className="case-diagram-status-pairs">{[0, 2].map((start) => <div key={start} className="case-diagram-paired case-diagram-paired--change">
      <DiagramNode item={items[start]} index={start} />
      <DiagramNode item={items[start + 1]} index={start + 1} tone="primary" />
    </div>)}</div>
    <Explanation items={items} />
  </>
}

function StateMap({ visual }: { visual: CaseVisualSpec }) {
  return <div className="case-diagram-state-map" style={{ '--diagram-target-count': visual.items.length } as CSSProperties}>
    <DiagramSequenceNode id="hub" className="case-diagram-state-root"><strong>{bindShortWords(stateCenters[visual.id])}</strong><span>Варианты состояния</span></DiagramSequenceNode>
    <div className="case-diagram-state-rail">
      {visual.items.map((item, index) => <DiagramSequenceNode key={item.label} id={`node-${index}`} index={index} className="case-diagram-state-row">
        <strong>{bindShortWords(item.label)}</strong>
        <div><span>{item.detail && bindShortWords(withoutFinalPeriod(item.detail))}</span>{item.note && <small>{item.note && bindShortWords(withoutFinalPeriod(item.note))}</small>}</div>
      </DiagramSequenceNode>)}
    </div>
  </div>
}

function EntityMap({ items }: { items: VisualItem[] }) {
  const groups = [
    { title: 'Откуда', entries: items.slice(0, 2) },
    { title: 'Что', entries: items.slice(2, 4) },
    { title: 'Куда', entries: items.slice(4) },
  ]
  return <div className="case-diagram-entity-map" aria-label="Сущности в контексте отправки: кошелёк и аккаунт, сеть и актив, адрес">
    {groups.map((group, index) => <div className="case-diagram-entity-group" key={group.title}>
      <DiagramSequenceNode id={`node-${index}`} index={index} className="case-diagram-entity-lane">
        <span className="case-diagram-overline">{group.title}</span>
        {group.entries.map((item) => <div key={item.label} className="case-diagram-entity-term"><strong>{bindShortWords(item.label)}</strong><span>{item.detail && bindShortWords(withoutFinalPeriod(item.detail))}</span></div>)}
      </DiagramSequenceNode>
    </div>)}
  </div>
}

function RiskMap({ items }: { items: VisualItem[] }) {
  return <div className="case-diagram-risk-map" aria-label="Факторы ошибок и их последствия">
    <div className="case-diagram-risk-heading"><span>Источник риска</span><span>Возможное последствие</span></div>
    {items.map((item, index) => <div className="case-diagram-risk-row" key={item.label}>
      <DiagramSequenceNode as="strong" id={`risk-source-${index}`} index={index}>{bindShortWords(item.label)}</DiagramSequenceNode><DiagramSequenceNode as="p" id={`risk-target-${index}`} index={index}>{item.detail && bindShortWords(withoutFinalPeriod(item.detail))}</DiagramSequenceNode>
    </div>)}
  </div>
}

function ChangeList({ items }: { items: VisualItem[] }) {
  return <div className="case-diagram-change-list" aria-label="Три изменения продукта">
    {items.map((item, index) => {
      const [before, after] = item.label.split('→').map((text) => text.trim())
      return <div className="case-diagram-change-row" key={item.label}>
        <DiagramSequenceNode as="span" id={`before-${index}`} index={index}>{bindShortWords(before)}</DiagramSequenceNode><DiagramSequenceNode as="strong" id={`after-${index}`} index={index}>{bindShortWords(after)}</DiagramSequenceNode>
        <p>{item.detail && bindShortWords(withoutFinalPeriod(item.detail))}</p>
      </div>
    })}
  </div>
}

function diagramEdges(visual: CaseVisualSpec, mode: DiagramMode): DiagramEdge[] {
  const node = (index: number) => `node-${index}`
  const chain = () => visual.items.slice(1).map((_, index) => ({ from: node(index), to: node(index + 1) }))
  const spokes = (from: string, count = visual.items.length) =>
    Array.from({ length: count }, (_, index) => ({ from, to: node(index) }))
  if (mode === 'service-map') return [0, 1].map((index) => ({ from: node(index), to: node(2) })).concat([
    { from: node(2), to: node(3) }, { from: node(3), to: node(4) },
  ])
  if (mode === 'filters') return [{ from: 'filter-controls', to: 'filter-results' }]
  if (mode === 'route') return chain()
  if (mode === 'branch') {
    if (visual.id === 'portal-flow') return [
      { from: node(0), to: node(1) }, { from: node(1), to: node(2) },
      { from: node(2), to: node(3) }, { from: node(3), to: 'yes' }, { from: node(3), to: 'no' },
    ]
    if (visual.id === 'atlyx-flight-flow') return [
      { from: node(0), to: node(1) }, { from: node(0), to: node(2) },
      { from: node(1), to: node(3) }, { from: node(2), to: node(3) },
    ]
    return visual.items.slice(1).map((_, index) => ({ from: node(0), to: node(index + 1) }))
  }
  if (mode === 'architecture') {
    const branchCount = visual.items.filter((item) => item.label !== diagramHubs[visual.id]).length
    const links = spokes('hub', branchCount)
    return visual.id === 'astoria-cms'
      ? links.concat(Array.from({ length: branchCount }, (_, index) => ({ from: node(index), to: 'end' })))
      : links
  }
  if (mode === 'convergence') return visual.items.map((_, index) => ({ from: node(index), to: 'hub' }))
  if (mode === 'status-branch') return [{ from: node(0), to: node(1) }, { from: node(0), to: node(2) }]
  if (mode === 'status-pairs') return [{ from: node(0), to: node(1) }, { from: node(2), to: node(3) }]
  if (mode === 'state-map') return spokes('hub')
  if (mode === 'entity-map') return [{ from: node(0), to: node(1) }, { from: node(1), to: node(2) }]
  if (mode === 'risk-map') return visual.items.map((_, index) => ({ from: `risk-source-${index}`, to: `risk-target-${index}` }))
  if (mode === 'change-list') return visual.items.map((_, index) => ({ from: `before-${index}`, to: `after-${index}` }))
  if (mode === 'transformation') return [{ from: node(0), to: node(1) }]
  return []
}

export function CaseDiagram({ visual, mode }: { visual: CaseVisualSpec; mode: DiagramMode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useEntrance(ref, .05)
  const { adaptive, reduced } = useMotionSystem()
  const edges = useMemo(() => diagramEdges(visual, mode), [visual, mode])
  const [measured, setMeasured] = useState(false)
  const onMeasured = useCallback(() => setMeasured(true), [])
  // Reveal once the complete desktop connection geometry exists. Never reset on resize.
  const visible = reduced || (inView && (adaptive || measured || !edges.length))
  return <DiagramSequence><motion.div ref={ref} className={`case-diagram case-diagram--${mode}`}
    initial={reduced ? false : { opacity: 0, transform: `translateY(${motionTokens.diagram.revealDistance}px)` }}
    animate={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0px)' : `translateY(${motionTokens.diagram.revealDistance}px)` }}
    transition={{ duration: reduced ? 0 : motionTokens.diagram.revealDuration, ease: motionTokens.ease }}>
    {adaptive && <MobileCaseDiagram visual={visual} mode={mode} />}
    {mode === 'service-map' && <ServiceMap items={visual.items} />}
    {mode === 'filters' && <FilterStates items={visual.items} />}
    {mode === 'route' && <Route visual={visual} />}
    {mode === 'branch' && <Branch visual={visual} />}
    {mode === 'architecture' && <Architecture visual={visual} />}
    {mode === 'convergence' && <Convergence items={visual.items}
      center={{ 'portal-support': 'Поддержка', 'astoria-intents': 'Подходящий тур', 'astoria-problem': 'Путь выбора и оформления', 'astoria-entry': 'Выдача туров' }[visual.id] ?? 'Выдача туров'}
      />}
    {mode === 'status-branch' && <StatusBranch items={visual.items} />}
    {mode === 'status-pairs' && <StatusPairs items={visual.items} />}
    {mode === 'state-map' && <StateMap visual={visual} />}
    {mode === 'entity-map' && <EntityMap items={visual.items} />}
    {mode === 'risk-map' && <RiskMap items={visual.items} />}
    {mode === 'change-list' && <ChangeList items={visual.items} />}
    {(mode === 'transformation' || mode === 'contrast') && <Paired visual={visual} transformation={mode === 'transformation'} />}
    <DiagramWires rootRef={ref} edges={edges} mode={mode} onMeasured={onMeasured} />
  </motion.div></DiagramSequence>
}
