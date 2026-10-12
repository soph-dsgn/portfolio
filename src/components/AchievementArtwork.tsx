import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { motionTokens, useMotionSystem } from '../lib/motion'

/** Existing trophy artwork, with independent gentle movement for its sparkles. */
export function AchievementArtwork() {
  const ref = useRef<SVGSVGElement>(null)
  const visible = useInView(ref)
  const { reduced } = useMotionSystem()
  const floating = visible && !reduced
  return <motion.svg ref={ref} viewBox="0 0 120 120" fill="none" aria-hidden="true" width="120" height="120">
    <motion.g style={{ transformOrigin: '60px 65px' }}
      animate={{ transform: floating ? ['translateY(0px) rotate(-.6deg)', 'translateY(-6px) rotate(.6deg)', 'translateY(0px) rotate(-.6deg)'] : 'none' }}
      transition={floating ? { duration: motionTokens.float.trophy, repeat: Infinity, ease: motionTokens.easeFloat } : { duration: motionTokens.reduced }}>
  <path d="M31 25H19v14c0 15 9 25 22 27l6-11c-11-1-16-6-16-17V25Z" fill="#B7822E"/>
  <path d="M89 25h12v14c0 15-9 25-22 27l-6-11c11-1 16-6 16-17V25Z" fill="#9C6927"/>
  <path d="M30 22h60v22c0 29-12 46-30 46S30 73 30 44V22Z" fill="#E6AD42"/>
  <path d="M64 25h23v19c0 24-8 39-23 42 7-18 8-40 0-61Z" fill="#C88B2F"/>
  <path d="M37 31v14c0 16 4 27 12 33" stroke="#FFE5A2" strokeWidth="5" strokeLinecap="round"/>
  <rect x="28" y="18" width="64" height="10" rx="5" fill="#F6CD70"/>
  <path d="M55 89h10v11H55z" fill="#493C35"/>
  <path d="M48 99h24l6 7H42l6-7Z" fill="#342E2C"/>
  <rect x="37" y="105" width="46" height="8" rx="4" fill="#221F20"/>
  <path d="M60 39c1.8 6.2 4.3 8.7 10.5 10.5C64.3 51.3 61.8 53.8 60 60c-1.8-6.2-4.3-8.7-10.5-10.5C55.7 47.7 58.2 45.2 60 39Z" fill="#F8F8F5"/>
    </motion.g>
    <motion.g animate={{ transform: floating ? ['translateY(0px)', 'translateY(-4px)', 'translateY(0px)'] : 'none' }}
      transition={floating ? { duration: motionTokens.float.sparkles[0], repeat: Infinity, delay: 0.0, ease: motionTokens.easeFloat } : { duration: motionTokens.reduced }}>
  <path d="M16 13C17 20 18 21 25 22C18 23 17 24 16 31C15 24 14 23 7 22C14 21 15 20 16 13Z" fill="var(--color-trophy-sparkle)"/>
    </motion.g>
    <motion.g animate={{ transform: floating ? ['translateY(0px)', 'translateY(-5px)', 'translateY(0px)'] : 'none' }}
      transition={floating ? { duration: motionTokens.float.sparkles[1], repeat: Infinity, delay: motionTokens.float.stagger, ease: motionTokens.easeFloat } : { duration: motionTokens.reduced }}>
  <path d="M101 39C102 45 103 46 109 47C103 48 102 49 101 55C100 49 99 48 93 47C99 46 100 45 101 39Z" fill="var(--color-trophy-sparkle)"/>
    </motion.g>
    <motion.g animate={{ transform: floating ? ['translateY(0px)', 'translateY(-6px)', 'translateY(0px)'] : 'none' }}
      transition={floating ? { duration: motionTokens.float.sparkles[2], repeat: Infinity, delay: 2 * motionTokens.float.stagger, ease: motionTokens.easeFloat } : { duration: motionTokens.reduced }}>
  <path d="M98 10C99 14 100 15 104 16C100 17 99 18 98 22C97 18 96 17 92 16C96 15 97 14 98 10Z" fill="var(--color-trophy-sparkle)"/>
    </motion.g>
  </motion.svg>
}
