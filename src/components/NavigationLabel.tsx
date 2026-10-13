import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { motionTokens, useMotionSystem } from '../lib/motion'

/** Active emphasis crossfades without an underline, extra surface or layout shift. */
export function NavigationLabel({ active = false, className, children }: {
  active?: boolean; className?: string; children: ReactNode
}) {
  const { reduced } = useMotionSystem()
  return <motion.span className={`navigation-label ${className ?? ''}`} initial={false}
    animate={{ opacity: active ? 1 : .94 }}
    transition={{ duration: reduced ? 0 : motionTokens.navState, ease: motionTokens.ease }}>
    {active && <motion.span aria-hidden="true" className="navigation-active-surface" initial={false} animate={{ opacity: .07 }} layoutId={reduced ? undefined : 'nav-active'}
      transition={reduced ? { duration: 0 } : motionTokens.interaction} />}
    <span className="navigation-label-text">{children}</span>
  </motion.span>
}
