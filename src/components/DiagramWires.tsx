import { motionTokens } from '../lib/motion'
import { useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import type { RefObject } from 'react'

export type DiagramEdge = { from: string; to: string }

type Box = { left: number; top: number; right: number; bottom: number; cx: number; cy: number }
type DrawnEdge = { key: string; path: string; arrow?: boolean; vertical?: boolean }

/** One shared stem, then branches with vertical tangents at both ends. */
function branchingConnector(source: Box, targets: { key: string; box: Box }[], gap: number, horizontal = false): DrawnEdge[] {
  const cross = horizontal ? source.cy : source.cx
  const start = (horizontal ? source.right : source.bottom) + gap
  const end = (box: Box) => (horizontal ? box.left : box.top) - gap
  const nearest = Math.min(...targets.map(target => end(target.box)))
  const fork = start + Math.min(20, (nearest - start) * .25)
  const point = (across: number, along: number) => horizontal ? `${along} ${across}` : `${across} ${along}`
  return [
    { key: `${targets[0].key}-stem`, path: `M ${point(cross, start)} L ${point(cross, fork)}`, arrow: false },
    ...targets.map(({ key, box }) => {
      const finish = end(box)
      const targetCross = horizontal ? box.cy : box.cx
      // A straight terminal preserves the cubic's tangent and keeps even the
      // outer arrowheads vertical, rather than following a tight curved hook.
      const terminal = Math.min(16, (finish - fork) * .15)
      const curveEnd = finish - terminal
      const handle = (curveEnd - fork) * .5
      return {
        key,
        vertical: !horizontal,
        path: `M ${point(cross, fork)} C ${point(cross, fork + handle)}, ${point(targetCross, curveEnd - handle)}, ${point(targetCross, curveEnd)} L ${point(targetCross, finish)}`,
      }
    }),
  ]
}

/** Incoming curves share a vertical tangent, then one stem enters the target. */
function convergingConnector(sources: { key: string; box: Box }[], target: Box, gap: number, horizontal = false): DrawnEdge[] {
  const cross = horizontal ? target.cy : target.cx
  const finish = (horizontal ? target.left : target.top) - gap
  const nearest = Math.max(...sources.map(source => (horizontal ? source.box.right : source.box.bottom) + gap))
  const join = finish - Math.min(20, (finish - nearest) * .25)
  const point = (across: number, along: number) => horizontal ? `${along} ${across}` : `${across} ${along}`
  return [
    ...sources.map(({ key, box }) => {
      const start = (horizontal ? box.right : box.bottom) + gap
      const sourceCross = horizontal ? box.cy : box.cx
      const handle = (join - start) * .5
      return { key, arrow: false, path: `M ${point(sourceCross, start)} C ${point(sourceCross, start + handle)}, ${point(cross, join - handle)}, ${point(cross, join)}` }
    }),
    { key: `${sources[0].key}-merge`, vertical: !horizontal, path: `M ${point(cross, join)} L ${point(cross, finish)}` },
  ]
}

function layoutBox(element: HTMLElement, root: HTMLElement): Box {
  let left = 0
  let top = 0
  let current: HTMLElement | null = element
  while (current && current !== root) {
    left += current.offsetLeft
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  const right = left + element.offsetWidth
  const bottom = top + element.offsetHeight
  return { left, top, right, bottom, cx: (left + right) / 2, cy: (top + bottom) / 2 }
}

function wirePath(from: Box, to: Box, nodes: Box[], mode: string, gap: number): string {
  // Ports follow measured geometry, including text wrapping and responsive rearrangement.
  if (to.left - from.right > gap * 2 || from.left - to.right > gap * 2) {
    const direction = to.cx > from.cx ? 1 : -1
    const x1 = (direction > 0 ? from.right : from.left) + direction * gap
    const x2 = (direction > 0 ? to.left : to.right) - direction * gap
    const bend = Math.abs(x2 - x1) * .5
    const terminal = Math.min(8, Math.abs(x2 - x1) * .15)
    const curveEnd = x2 - direction * terminal
    return `M ${x1} ${from.cy} C ${x1 + direction * bend} ${from.cy}, ${curveEnd - direction * bend} ${to.cy}, ${curveEnd} ${to.cy} L ${x2} ${to.cy}`
  }
  const down = to.cy >= from.cy
  const y1 = down ? from.bottom + gap : from.top - gap
  const y2 = down ? to.top - gap : to.bottom + gap
  const direction = down ? 1 : -1
  const between = nodes.filter(node => node !== from && node !== to &&
    node.top < Math.max(y1, y2) && node.bottom > Math.min(y1, y2) &&
    node.left <= Math.max(from.cx, to.cx) && node.right >= Math.min(from.cx, to.cx))
  if (between.length) {
    // Skip intervening stacked states in one outside lane, with smooth cubic turns.
    const right = mode === 'convergence'
    const lane = right ? Math.max(from.right, to.right, ...between.map(n => n.right)) + 12
      : Math.min(from.left, to.left, ...between.map(n => n.left)) - 12
    const x1 = right ? from.right + gap : from.left - gap
    const turn = Math.min(24, Math.abs(to.cy - from.cy) / 4)
    const terminal = Math.min(8, Math.abs(y2 - y1) * .1)
    const curveEnd = y2 - direction * terminal
    return `M ${x1} ${from.cy} C ${lane} ${from.cy}, ${lane} ${from.cy}, ${lane} ${from.cy + direction * turn} L ${lane} ${curveEnd - direction * turn} C ${lane} ${curveEnd}, ${to.cx} ${curveEnd - direction * turn}, ${to.cx} ${curveEnd} L ${to.cx} ${y2}`
  }
  const bend = Math.abs(y2 - y1) * .5
  const terminal = Math.min(8, Math.abs(y2 - y1) * .15)
  const curveEnd = y2 - direction * terminal
  return `M ${from.cx} ${y1} C ${from.cx} ${y1 + direction * bend}, ${to.cx} ${curveEnd - direction * bend}, ${to.cx} ${curveEnd} L ${to.cx} ${y2}`
}

export function DiagramWires({ rootRef, edges, mode, visible, reduced }: {
  rootRef: RefObject<HTMLDivElement | null>
  edges: DiagramEdge[]
  mode: string
  visible: boolean
  reduced: boolean
}) {
  const markerId = `${useId().replace(/:/g, '')}-diagram-arrow`
  const [drawing, setDrawing] = useState<{ width: number; height: number; paths: DrawnEdge[] }>({ width: 0, height: 0, paths: [] })
  const [geometry, setGeometry] = useState({ stroke: 1.6, arrow: 7 })

  useEffect(() => {
    const root = rootRef.current
    if (!root || !edges.length) return
    let active = true
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-diagram-node]')]
    const measure = () => {
      if (!active) return
      const byId = new Map(nodes.map((node) => [node.dataset.diagramNode, layoutBox(node, root)]))
      const boxes = [...byId.values()]
      const styles = getComputedStyle(root)
      const gap = Number(styles.getPropertyValue('--diagram-port-gap')) || 8
      setGeometry({ stroke: Number(styles.getPropertyValue('--diagram-stroke')) || 1.6, arrow: Number(styles.getPropertyValue('--diagram-arrow-size')) || 7 })
      const groups = new Map<string, { key: string; box: Box }[]>()
      const incoming = new Map<string, { key: string; box: Box }[]>()
      edges.forEach(({ from, to }, index) => {
        const end = byId.get(to)
        if (end) groups.set(from, [...(groups.get(from) ?? []), { key: `${from}-${to}-${index}`, box: end }])
        const source = byId.get(from)
        if (source) incoming.set(to, [...(incoming.get(to) ?? []), { key: `${from}-${to}-${index}`, box: source }])
      })
      const mergedKeys = new Set<string>()
      const merges = [...incoming].flatMap(([to, sources]) => {
        const target = byId.get(to)
        const sameRow = Math.max(...sources.map(source => source.box.top)) - Math.min(...sources.map(source => source.box.top)) < 2
        const sameColumn = Math.max(...sources.map(source => source.box.left)) - Math.min(...sources.map(source => source.box.left)) < 2
        if (!target || sources.length < 2) return []
        const vertical = sameRow && sources.every(source => target.top > source.box.bottom + gap * 2)
        const horizontal = sameColumn && sources.every(source => target.left > source.box.right + gap * 2)
        if (!vertical && !horizontal) return []
        sources.forEach(source => mergedKeys.add(source.key))
        return convergingConnector(sources, target, gap, horizontal)
      })
      const paths = [...groups].flatMap(([from, allTargets]) => {
        const targets = allTargets.filter(target => !mergedKeys.has(target.key))
        const start = byId.get(from)
        if (!start || !targets.length) return []
        // The same Y pattern serves hubs, decisions and status branches. Stacked
        // mobile targets keep their outside lanes so wires never cross cards.
        const sameRow = Math.max(...targets.map(target => target.box.top)) - Math.min(...targets.map(target => target.box.top)) < 2
        const below = targets.every(target => target.box.top > start.bottom + gap * 2)
        if (targets.length > 1 && sameRow && below) return branchingConnector(start, targets, gap)
        const sameColumn = Math.max(...targets.map(target => target.box.left)) - Math.min(...targets.map(target => target.box.left)) < 2
        const right = targets.every(target => target.box.left > start.right + gap * 2)
        if (targets.length > 1 && sameColumn && right) return branchingConnector(start, targets, gap, true)
        return targets.filter(target => !mergedKeys.has(target.key)).map(({ key, box }) => ({ key, vertical: box.top > start.bottom + gap * 2, path: wirePath(start, box, boxes, mode, gap) }))
      })
      setDrawing({ width: root.clientWidth, height: root.clientHeight, paths: [...paths, ...merges] })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    nodes.forEach((node) => observer.observe(node))
    window.addEventListener('resize', measure)
    void document.fonts.ready.then(measure)
    return () => {
      active = false
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [rootRef, edges, mode])

  if (!drawing.paths.length) return null
  return <svg className="case-diagram-wires" viewBox={`0 0 ${drawing.width} ${drawing.height}`}
    width={drawing.width} height={drawing.height} aria-hidden="true">
    <defs>
      {['auto', '90'].map(orientation => <marker key={orientation} id={orientation === '90' ? `${markerId}-down` : markerId} viewBox="0 0 8 8" markerWidth={geometry.arrow} markerHeight={geometry.arrow}
        refX="7" refY="4" orient={orientation} markerUnits="userSpaceOnUse">
        <path d="M1 1 7 4 1 7" fill="none" stroke="currentColor" strokeWidth={geometry.stroke}
          strokeLinecap="round" strokeLinejoin="round" />
      </marker>)}
    </defs>
    {drawing.paths.map((edge, index) => <motion.path key={edge.key} d={edge.path}
      fill="none" stroke="currentColor" strokeWidth={geometry.stroke} strokeLinecap="round" strokeLinejoin="round"
      markerEnd={edge.arrow === false ? undefined : `url(#${markerId}${edge.vertical ? '-down' : ''})`} initial={false}
      animate={{ pathLength: reduced || visible ? 1 : 0, opacity: reduced || visible ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : motionTokens.diagram.wire, delay: visible && !reduced ? motionTokens.diagram.wireStart + Math.min(index * motionTokens.diagram.wireStagger, motionTokens.diagram.maxWireDelay) : 0, ease: motionTokens.ease }} />)}
  </svg>
}
