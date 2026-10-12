import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { motionTokens, useMotionSystem } from '../lib/motion'

/** Active emphasis crossfades without an underline, extra surface or layout shift. */
export function NavigationLabel({ active = false, className, children }: {
  active?: boolean; className?: string; children: ReactNode
}) {
  const { reduced } = useMotionSystem()
  return <motion.span className={className} initial={false}
    animate={{ opacity: active ? 1 : .94 }}
    transition={{ duration: reduced ? 0 : motionTokens.navState, ease: motionTokens.ease }}>
    {children}
  </motion.span>
}
