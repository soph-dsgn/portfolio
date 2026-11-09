import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { useLocale } from '../i18n/locale'

/** Navigation emphasis stays in the text, without an extra surface. */
export function NavigationLabel({ active = false, className, children }: {
  active?: boolean; className?: string; children: ReactNode
}) {
  const { reduced } = useMotionSystem()
  const { locale } = useLocale()
  return <span className={`navigation-label ${className ?? ''}`}>
    <motion.span className="navigation-label-text" initial={false}
      animate={{ opacity: active ? 1 : .94 }}
      transition={{ duration: reduced ? 0 : motionTokens.navState, ease: motionTokens.ease }}>
      <span className="home-localized-copy" key={locale}>{children}</span>
    </motion.span>
  </span>
}
