import { motion } from 'framer-motion'
import { motionTokens, useInterfaceReady, useMotionSystem } from '../lib/motion'
import type { ReactNode } from 'react'

/** A single clipped title entrance; no generic reveal competes with it. */
export function CaseTitle({ children }: { children: ReactNode }) {
  const ready = useInterfaceReady()
  const { reduced } = useMotionSystem()
  return <h1 className="case-title-mask"><motion.span style={{ display: 'block' }}
    initial={reduced ? false : { transform: 'translateY(105%)' }}
    animate={{ transform: ready || reduced ? 'translateY(0%)' : 'translateY(105%)' }}
    transition={{ duration: reduced ? 0 : motionTokens.signature.title.duration, ease: motionTokens.ease }}>{children}</motion.span></h1>
}

export function CaseDeck({ children }: { children: ReactNode }) {
  const ready = useInterfaceReady()
  const { reduced } = useMotionSystem()
  return <motion.p className="case-deck" initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
    animate={ready ? { opacity: 1, transform: 'translateY(0px)' } : { opacity: 0, transform: reduced ? 'none' : 'translateY(10px)' }}
    transition={{ duration: reduced ? 0 : motionTokens.reveal, delay: reduced ? 0 : motionTokens.signature.title.deckDelay, ease: motionTokens.ease }}>{children}</motion.p>
}
