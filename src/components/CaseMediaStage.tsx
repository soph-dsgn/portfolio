import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SceneSurface } from './SceneSurface'
import { motionTokens, useMotionSystem } from '../lib/motion'

/** Shared silhouette with independent presentation for concepts and dense screen groups. */
export function CaseMediaStage({ children, fill = false, multiScreen = false, contained = false, heightFill = false }: {
  children: ReactNode
  fill?: boolean
  multiScreen?: boolean
  contained?: boolean
  heightFill?: boolean
}) {
  const { reduced, adaptive } = useMotionSystem()
  const [assembled, setAssembled] = useState(false)
  const variant = fill ? ' case-media-stage--fill'
    : heightFill ? ' case-media-stage--height-fill'
    : multiScreen ? ' case-media-stage--multi-screen'
    : contained ? ' case-media-stage--contained' : ''
  return <SceneSurface className={`case-media-stage${variant}`}>
    {children}
    {!fill && !reduced && !assembled && <motion.div className="case-media-assembly" aria-hidden="true"
      initial="waiting" whileInView="assembled" viewport={{ once: true, amount: .12 }}>
      {[0, 1, 2, 3].map(index => <motion.span key={index}
        variants={{
          waiting: { opacity: 1, transform: `translateY(${(index < 2 ? -1 : 1) * (adaptive ? 4 : 12)}px)` },
          assembled: { opacity: 0, transform: 'translateY(0px)', transition: {
            duration: adaptive ? motionTokens.mediaAssemblyMobile : motionTokens.mediaAssembly,
            delay: index * motionTokens.assemblyStagger, ease: motionTokens.ease,
          } },
        }}
        onAnimationComplete={index === 3 ? () => setAssembled(true) : undefined}
      />)}
    </motion.div>}
  </SceneSurface>
}
