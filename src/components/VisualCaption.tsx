import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useEntrance } from '../lib/useEntrance'
import { motionTokens, useMotionSystem } from '../lib/motion'
import type { ReactNode } from 'react'
import { Typography } from './Typography'

export function VisualCaption({ children, action, concept = false }: { children: ReactNode; action?: ReactNode; concept?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const visible = useEntrance(ref, .05)
  const { adaptive, reduced, mobileEntrance } = useMotionSystem()
  return (
    <motion.figcaption ref={ref} className="visual-caption" initial={adaptive && !reduced ? 'hidden' : false}
      animate={!adaptive || visible ? 'visible' : 'hidden'} variants={adaptive ? { ...mobileEntrance(concept ? motionTokens.mobile.media.conceptCaptionY : motionTokens.mobile.media.captionY), visible: { opacity: 1, transform: 'translate3d(0px, 0px, 0px) scale(1)', transition: { duration: reduced ? motionTokens.reduced : motionTokens.mobile.entrance, delay: reduced ? 0 : motionTokens.mobile.captionDelay, ease: motionTokens.ease } } } : undefined}
      transition={{ delay: reduced ? 0 : motionTokens.mobile.captionDelay }}>
      <span className="visual-caption-text"><Typography>{children}</Typography></span>
      {action}
    </motion.figcaption>
  )
}
