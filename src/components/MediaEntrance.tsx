import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEntrance } from '../lib/useEntrance'

/** Entrance and repeated concept focus use separate transform owners. */
export function MediaEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useEntrance(ref, .08)
  const { adaptive, reduced } = useMotionSystem()
  return <motion.div ref={ref} data-media-entered={visible} initial={reduced ? false : { opacity: adaptive ? motionTokens.mobile.media.opacity : 0, transform: `translateY(${adaptive ? motionTokens.mobile.media.conceptY : motionTokens.signature.media.y}px) scale(${adaptive ? motionTokens.mobile.media.scale : motionTokens.signature.media.scale})` }}
    animate={visible ? { opacity: 1, transform: 'translateY(0px) scale(1)' } : { opacity: adaptive ? motionTokens.mobile.media.opacity : 0, transform: reduced ? 'none' : `translateY(${adaptive ? motionTokens.mobile.media.conceptY : motionTokens.signature.media.y}px) scale(${adaptive ? motionTokens.mobile.media.scale : motionTokens.signature.media.scale})` }}
    transition={{ duration: reduced ? motionTokens.reduced : motionTokens.mobile.media.duration, ease: motionTokens.ease }}>{children}</motion.div>
}
