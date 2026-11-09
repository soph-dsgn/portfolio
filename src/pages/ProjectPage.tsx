import { CaseTitle, CaseDeck } from '../components/CaseTitle'
import { usePortalEntry } from '../lib/usePortalEntry'
import { useLocale } from '../i18n/locale'
import { useMotionSystem } from '../lib/motion'
import { lazy, Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { profile } from '../data/portfolio'
import { caseProjects as projects } from '../data/caseProjects'
import { getCaseGroups, withoutFinalPeriod } from '../data/caseContent'
import type { CaseNode } from '../data/caseContent'
import { Icon } from '../components/Icon'
import { CaseVisual } from '../components/CaseVisual'
import type { CaseVisualSpec } from '../components/CaseVisual'
import { diagramModeFor } from '../data/caseDiagramModes'
import { InlineArrows } from '../components/ArrowIcon'
import { Typography } from '../components/Typography'
import { MetaSeparatedText } from '../components/MetaSeparatedText'
import { visualsAfter } from '../data/caseVisuals'
import { CaseEditorialText } from '../components/CaseEditorialText'
import { CaseInlineMedia } from '../components/CaseInlineMedia'
import { Footer } from '../components/Footer'
import { audienceStatementLength, companionStart, isNarrativeLead } from '../lib/caseEditorial'
import { skywalletMediaAfter } from '../data/skywalletMedia'
import { partnerPortalMediaAfter } from '../data/partnerPortalMedia'
import '../styles/caseEditorial.css'

const ConceptCasePage = lazy(() => import('./ConceptCasePage').then(module => ({ default: module.ConceptCasePage })))

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

function CaseDocumentNodes({ nodes, projectId, groupId, groupTitle }: { nodes: CaseNode[]; projectId: string; groupId: string; groupTitle: string }) {
  let precedingHeading = groupTitle
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
        blocks.push({ key: visual.id, visual, content: <CaseVisual visual={visual} precedingHeading={groupTitle} /> })
      }
      return
    }
    if (node.kind === 'heading') {
      if (textNodes.some(node => node.kind !== 'heading')) flushText()
      precedingHeading = node.text
    }
    textNodes.push(node)
    const text = node.kind === 'list' ? node.items.join(' ') : node.text
    for (const visual of visualsAfter(projectId, groupId, text)) {
      flushText()
      blocks.push({ key: visual.id, visual, content: <CaseVisual visual={visual} precedingHeading={precedingHeading} /> })
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
  const editorial: ReactNode[] = []
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    const next = blocks[index + 1]
    const companionMode = next?.visual && !next.visual.presentation && diagramModeFor(next.visual.id)
    const start = block.nodes && next?.visual?.items.length === 2 &&
      (companionMode === 'contrast' || companionMode === 'transformation') ? companionStart(block.nodes) : null
    if (block.nodes && start !== null) {
      const intro = block.nodes.slice(0, start)
      const explanation = block.nodes.slice(start)
      // Keep a short list with the sentence that introduces it, even when a
      // generated diagram was inserted between those source nodes.
      const continuation = blocks[index + 2]
      const firstNode = continuation?.nodes?.[0]
      if (isNarrativeLead(explanation[explanation.length - 1]) && firstNode?.kind === 'list' && firstNode.items.join(' ').length <= 400) {
        explanation.push(firstNode)
        const remaining = continuation.nodes!.slice(1)
        if (remaining.length) {
          continuation.nodes = remaining
          continuation.content = remaining.map((node, nodeIndex) => <CaseNodeView node={node} key={nodeIndex} />)
        } else blocks.splice(index + 2, 1)
      }
      if (intro.length) editorial.push(<CaseEditorialText nodes={intro} section={groupId}
        width={groupId !== 'final' && intro.every(node => node.kind === 'paragraph') && intro.reduce((sum, node) => sum + (node.kind === 'paragraph' ? node.text.length : 0), 0) <= 260 ? 'narrow' : undefined}
        key={`${block.key}-intro`}>
        {intro.map((node, nodeIndex) => <CaseNodeView node={node} key={nodeIndex} />)}
      </CaseEditorialText>)
      editorial.push(<div className="case-layout--text-visual" key={block.key}>
        <CaseEditorialText nodes={explanation} section={groupId}>
          {explanation.map((node, nodeIndex) => <CaseNodeView node={node} key={nodeIndex} />)}
        </CaseEditorialText>
        {next.content}
      </div>)
      index += 1
    } else {
      editorial.push(block.nodes
        ? <CaseEditorialText nodes={block.nodes} section={groupId} key={block.key}>{block.content}</CaseEditorialText>
        : <div className="case-editorial-visual case-layout--wide" key={block.key}>{block.content}</div>)
    }
  }
  return <div className="case-editorial-flow">{editorial}</div>
}

export function ProjectPage() {
  const portalEntry = usePortalEntry()
  const { t } = useLocale()
  const { slug } = useParams()
  const project = projects.find((item) => item.id === slug)

  useEffect(() => {
    document.title = project
      ? `${t(project.title)} — ${t(profile.name)}`
      : `${t('Проект не найден')} — ${t(profile.name)}`
  }, [project, t])
  useEffect(() => {
    document.dispatchEvent(new Event('reveal-content-ready'))
  }, [project?.id])

  if (!project)
    return (
      <main className="not-found" id="main-content" tabIndex={-1}>
        <h1>Проект не найден</h1>
        <p>Другие мои работы есть на главной</p>
        <Link className="button" to="/">На главную</Link>
      </main>
    )

  if (project.videos)
    return <Suspense fallback={null}><ConceptCasePage project={project} /></Suspense>

  const groups = getCaseGroups(project)
  return (
    <Typography><div className="case-shell case-shell--editorial" key={project.id}>
      <main className="case-main" id="main-content" tabIndex={-1}>
        <motion.header {...portalEntry} className="case-header" id="overview">
          <p className="case-project-meta" aria-label="Параметры проекта">
            <span>{project.niche ? <MetaSeparatedText value={project.niche} separator="slash" /> : null}</span>
            <span aria-hidden="true">·</span>
            <span><MetaSeparatedText value={project.platform} /></span>
            <span aria-hidden="true">·</span>
            <span>{project.discipline}</span>
          </p>
          <CaseTitle>{project.title}</CaseTitle>
          <CaseDeck>{withoutFinalPeriod(project.description)}</CaseDeck>
          {project.figmaUrl ? (
            <div className="case-meta" data-reveal="case-intro" data-reveal-order="0">
              <a className="button figma-button" href={project.figmaUrl} target="_blank" rel="noreferrer">
                Figma-файл <span className="icon-motion"><Icon name="external" /></span>
              </a>
            </div>
          ) : null}
        </motion.header>
        <div className="case-content" id="case-content">
          {groups.map((group) => (
            <div className="case-document-group" key={group.id}>
              <section className="case-section case-document-section" id={group.id} aria-labelledby={`${group.id}-title`}>
                <h2 id={`${group.id}-title`} data-reveal="text">{group.title}</h2>
                <CaseDocumentNodes nodes={group.nodes} projectId={project.id} groupId={group.id} groupTitle={group.title} />
              </section>
            </div>
          ))}
        </div>
      </main>
      <Footer variant="case" />
    </div></Typography>
  )
}
