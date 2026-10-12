import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { motionTokens } from '../lib/motion'
import type { DiagramEdge } from './DiagramWires'

const SequenceContext = createContext({ visible: true, reduced: true, targets: new Set<string>() })

export function DiagramSequence({ edges, visible, reduced, children }: {
  edges: DiagramEdge[]; visible: boolean; reduced: boolean; children: ReactNode
}) {
  const targets = useMemo(() => new Set(edges.map(edge => edge.to)), [edges])
  return <SequenceContext value={{ visible, reduced, targets }}>{children}</SequenceContext>
}

function useDiagramNodeAnimation(id: string, index = 0) {
  const { visible, reduced, targets } = useContext(SequenceContext)
  const target = targets.has(id)
  return {
    initial: false as const,
    animate: { opacity: visible || reduced ? 1 : 0, transform: reduced || visible ? 'translateY(0px)' : 'translateY(6px)' },
    transition: { duration: reduced ? 0 : target ? motionTokens.diagram.node : motionTokens.diagram.source,
      delay: visible && !reduced ? target ? motionTokens.diagram.targetStart + Math.min(index * motionTokens.diagram.stagger, motionTokens.diagram.maxNodeDelay) : 0 : 0,
      ease: motionTokens.ease },
  }
}

const nodeElements = { div: motion.div, strong: motion.strong, span: motion.span, p: motion.p }

export function DiagramSequenceNode({ id, index = 0, className, children, as = 'div' }: {
  id: string; index?: number; className?: string; children: ReactNode; as?: keyof typeof nodeElements
}) {
  const animation = useDiagramNodeAnimation(id, index)
  const Element = nodeElements[as]
  return <Element {...animation} className={className} data-diagram-node={id}>{children}</Element>
}
