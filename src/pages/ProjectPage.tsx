import { usePortalEntry } from '../lib/usePortalEntry'
import { useLocale } from '../i18n/locale'
import { useMotionSystem } from '../lib/motion'
import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { profile } from '../data/portfolio'
import { caseProjects as projects } from '../data/caseProjects'
import { getCaseGroups, withoutFinalPeriod } from '../data/caseContent'
import type { CaseNode } from '../data/caseContent'
import type { CaseVisualSpec } from '../data/caseVisualTypes'
import { InlineArrows } from '../components/ArrowIcon'
import { Typography } from '../components/Typography'
import { visualsAfter } from '../data/caseVisuals'
import { CaseEditorialText } from '../components/CaseEditorialText'
import { CaseInlineMedia } from '../components/CaseInlineMedia'
import { Footer } from '../components/Footer'
import { audienceStatementLength, isNarrativeLead } from '../lib/caseEditorial'
import { skywalletMediaAfter } from '../data/skywalletMedia'
import { partnerPortalMediaAfter } from '../data/partnerPortalMedia'
import { CaseCard } from '../components/ShowcaseCase'
import { CaseSectionRail } from '../components/CaseSectionRail'
import { ShowcaseVisual } from '../components/ShowcaseVisual'
import { showcaseCases } from '../data/showcaseCases'
import '../styles/caseEditorial.css'
import '../styles/caseShowcase.css'

// Cases use the home-page visual language: case-card header, numbered sections, diagrams as cards and pills.
const isShowcaseCase = (projectId: string): projectId is keyof typeof showcaseCases => projectId in showcaseCases

function CaseNodeView({ node }: { node: CaseNode }) {
  if (node.kind === 'heading') {
    const className = /^(Проблема|Решение|Результат)$/.test(node.text.trim()) ? 'case-outcome-label' : undefined
    const id = node.text.startsWith('Рефлексия') ? 'reflection' : undefined
    return node.level === 4 ? <h4 id={id} className={className}><InlineArrows text={node.text} /></h4> : <h3 id={id} className={className}><InlineArrows text={node.text} /></h3>
  }
  if (node.kind === 'list') {
    const List = node.ordered ? 'ol' : 'ul'
    return (
      <List className={node.ordered ? 'step-list' : 'star-list'} role="list">
        {node.items.map((item, index) => <li key={index}><InlineArrows text={withoutFinalPeriod(item)} /></li>)}
      </List>
    )
  }
  const text = withoutFinalPeriod(node.text)
  const audienceLead = audienceStatementLength(node)
  if (audienceLead) return <p className="case-audience-intro">
    <strong><InlineArrows text={text.slice(0, audienceLead)} /></strong>
    <span><InlineArrows text={text.slice(audienceLead)} /></span>
  </p>
  return <p className={isNarrativeLead(node) ? 'case-narrative-lead' : undefined}><InlineArrows text={text} /></p>
}

function splitResult(text: string) {
  const statement = text.replace(/^\s*—\s*/, '').trim()
  const explanation = statement.search(/\s+(?:за счёт|благодаря)\s+/i)
  if (explanation >= 0) return { lead: statement.slice(0, explanation), detail: statement.slice(explanation).trim() }
  const metric = /[+−-]?\d+(?:[–-]\d+)?\s*(?:%|п\.\s*п\.)/i.exec(statement)
  if (!metric || metric.index === undefined) return { lead: statement, detail: '' }
  const detail = [
    statement.slice(0, metric.index).replace(/(?:\s+на|\s+в)\s*$/, '').replace(/\s+—\s*$/, '').trim(),
    statement.slice(metric.index + metric[0].length).trim(),
  ].filter(Boolean).join(' ')
  return { lead: metric[0], detail }
}

function CaseResults({ items }: { items: string[] }) {
  const { reveal, variants } = useMotionSystem()
  return (
      <Typography><dl className="case-facts case-results case-metric-grid" aria-label="Результаты проекта">
        {items.map((item, index) => {
          const { lead, detail } = splitResult(item)
          return <motion.div key={item} {...reveal('scale', index * .05)}><motion.dt variants={variants('fade', index * .05)}>{withoutFinalPeriod(lead)}</motion.dt>{detail && <motion.dd variants={variants('fade', .1 + index * .05)}>{withoutFinalPeriod(detail)}</motion.dd>}</motion.div>
        })}
      </dl></Typography>
  )
}

function CaseDocumentNodes({ nodes, projectId, groupId }: { nodes: CaseNode[]; projectId: string; groupId: string }) {
  let textNodes: CaseNode[] = []
  let blockIndex = 0
  const blocks: { content: ReactNode; nodes?: CaseNode[]; visual?: CaseVisualSpec; key: string }[] = []
  const flushText = () => {
    if (!textNodes.length) return
    const current = textNodes
    textNodes = []
    const key = `text-${blockIndex++}`
    blocks.push({ nodes: current, key, content: current.map((node, index) => <CaseNodeView node={node} key={index} />) })
  }
  nodes.forEach((node) => {
    if (groupId === 'final' && node.kind === 'list' && blockIndex === 0 && textNodes.length === 0) {
      const resultVisuals = visualsAfter(projectId, groupId, node.items.join(' '))
      blocks.push({ key: "results", content: <CaseResults items={node.items} /> })
      blockIndex += 1
      for (const visual of resultVisuals) {
        blocks.push({ key: visual.id, visual, content: <ShowcaseVisual visual={visual} /> })
      }
      return
    }
    if (node.kind === 'heading' && textNodes.some(node => node.kind !== 'heading')) flushText()
    textNodes.push(node)
    const text = node.kind === 'list' ? node.items.join(' ') : node.text
    for (const visual of visualsAfter(projectId, groupId, text)) {
      flushText()
      blocks.push({ key: visual.id, visual, content: <ShowcaseVisual visual={visual} /> })
    }
    for (const placement of skywalletMediaAfter(projectId, groupId, text)) {
      flushText()
      blocks.push({ key: placement.id, content: <CaseInlineMedia placement={placement} /> })
    }
    for (const placement of partnerPortalMediaAfter(projectId, groupId, text)) {
      flushText()
      blocks.push({ key: placement.id, content: <CaseInlineMedia placement={placement} /> })
    }
  })
  flushText()
  const editorial = blocks.map(block => block.nodes
    ? <CaseEditorialText nodes={block.nodes} section={groupId} key={block.key}>{block.content}</CaseEditorialText>
    : <div className="case-editorial-visual case-layout--wide" key={block.key}>{block.content}</div>)
  return <div className="case-editorial-flow">{editorial}</div>
}

export function ProjectPage() {
  const portalEntry = usePortalEntry()
  const { t } = useLocale()
  const { slug } = useParams()
  const project = projects.find((item) => item.id === slug)
  const groups = useMemo(() => project && !project.videos ? getCaseGroups(project) : [], [project])
  const railSections = useMemo(() => groups.map(group => ({ id: group.id, title: group.title })), [groups])

  useEffect(() => {
    document.title = project
      ? `${t(project.title)} — ${t(profile.name)}`
      : `${t('Проект не найден')} — ${t(profile.name)}`
  }, [project, t])
  useEffect(() => {
    document.dispatchEvent(new Event('reveal-content-ready'))
  }, [project?.id])

  // Concepts no longer have their own page: they open as previews from the home slider.
  if (!project || project.videos || !isShowcaseCase(project.id))
    return (
      <main className="not-found" id="main-content" tabIndex={-1}>
        <h1>Проект не найден</h1>
        <p>Другие мои работы есть на главной</p>
        <Link className="button" to="/">На главную</Link>
      </main>
    )

  return (
    <Typography><div className="case-shell case-shell--editorial" key={project.id}>
      <main className="case-main" id="main-content" tabIndex={-1}>
        <motion.div {...portalEntry} className="scc-header" id="overview">
          <CaseCard item={showcaseCases[project.id]} page />
          <dl className="scc-facts" aria-label="Параметры проекта">
            <div><dt>Роль</dt><dd>{project.discipline}</dd></div>
            <div><dt>Платформа</dt><dd>{project.platform}</dd></div>
            <div><dt>Ниша</dt><dd>{project.niche ?? project.tags.join(' · ')}</dd></div>
          </dl>
        </motion.div>
        <CaseSectionRail sections={railSections} />
        <div className="case-content" id="case-content">
          {groups.map((group) => (
            <div className="case-document-group" key={group.id}>
              <section className={`case-section case-document-section scc-section`} id={group.id} aria-labelledby={`${group.id}-title`}>
                <h2 id={`${group.id}-title`} data-reveal="text" data-index={String(groups.indexOf(group) + 1).padStart(2, '0')}>{group.title}</h2>
                <CaseDocumentNodes nodes={group.nodes} projectId={project.id} groupId={group.id} />
              </section>
            </div>
          ))}
        </div>
      </main>
      <Footer variant="case" />
    </div></Typography>
  )
}
