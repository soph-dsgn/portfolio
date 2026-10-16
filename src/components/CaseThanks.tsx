import { motion } from 'framer-motion'
import { useRef } from 'react'
import { AchievementArtwork } from './AchievementArtwork'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEntrance } from '../lib/useEntrance'

export function CaseThanks({ id }: { id?: string }) {
  const { variants, adaptive, reduced } = useMotionSystem()
  const ref = useRef<HTMLElement>(null)
  const visible = useEntrance(ref, adaptive ? .2 : .04)
  const phase = (delay: number) => ({ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: reduced ? 0 : motionTokens.mobile.entrance, delay: reduced ? 0 : delay, ease: motionTokens.ease } } })
  return (
    <motion.aside ref={ref} className="case-thanks" id={id}
      aria-label="Достижение за изучение кейса"
      initial={visible ? 'visible' : 'hidden'} animate={visible ? 'visible' : 'hidden'}
      variants={adaptive ? undefined : variants('fade')}>
      <AchievementArtwork entered={visible} />
      <motion.h2 variants={adaptive ? phase(motionTokens.mobile.achievement.titleStart) : { hidden: { opacity: 1 }, visible: { opacity: 1 } }}>Любопытный исследователь</motion.h2>
      <motion.p variants={adaptive ? phase(motionTokens.mobile.achievement.textStart) : { hidden: { opacity: 1 }, visible: { opacity: 1 } }}>Вы добрались до конца кейса — не каждый доходит так далеко!</motion.p>
    </motion.aside>
  )
}
