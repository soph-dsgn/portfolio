import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEntrance } from '../lib/useEntrance'

/** Entrance and repeated concept focus use separate transform owners. */
export function MediaEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useEntrance(ref, .08)
  const { adaptive, reduced, mobileMask } = useMotionSystem()
  const desktopHidden = { opacity: 0, transform: `translateY(${motionTokens.signature.media.y}px) scale(${motionTokens.signature.media.scale})`, clipPath: motionTokens.mobile.mask.open }
  const resting = { opacity: 1, transform: 'translateY(0px) scale(1)', clipPath: motionTokens.mobile.mask.open }
  // Observe an unclipped shell. Observing the closed reveal layer itself makes
  // IntersectionObserver report zero visible area and can deadlock the reveal.
  return <div ref={ref} data-media-entered={visible}><motion.div initial={visible ? false : adaptive ? { ...mobileMask().hidden, opacity: 1, transform: 'none' } : desktopHidden}
    animate={visible ? resting : adaptive ? { ...mobileMask().hidden, opacity: 1, transform: 'none' } : desktopHidden}
    transition={{ duration: reduced ? 0 : adaptive ? motionTokens.mobile.mask.duration : motionTokens.signature.media.duration, ease: motionTokens.ease }}>{children}</motion.div></div>
}
