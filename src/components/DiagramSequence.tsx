import type { ReactNode } from 'react'

/** Geometry grouping only: the outer CaseDiagram owns the complete reveal. */
export function DiagramSequence({ children }: { children: ReactNode }) {
  return <>{children}</>
}

const nodeElements = { div: 'div', strong: 'strong', span: 'span', p: 'p' } as const

export function DiagramSequenceNode({ id, className, children, as = 'div' }: {
  id: string; index?: number; className?: string; children: ReactNode; as?: keyof typeof nodeElements
}) {
  const Element = nodeElements[as]
  return <Element className={className} data-diagram-node={id}>{children}</Element>
}
