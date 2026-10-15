import { motion } from 'framer-motion'
import { AchievementArtwork } from './AchievementArtwork'
import { useMotionSystem } from '../lib/motion'

export function CaseThanks({ id }: { id?: string }) {
  const { reveal } = useMotionSystem()

  return (
    <motion.aside
      className="case-thanks"
      id={id}
      aria-label="Достижение за изучение кейса"
      {...reveal('fade')}
    >
      <AchievementArtwork />
      <p className="case-thanks-eyebrow">Спасибо, что дочитали</p>
      <h2>Любопытный исследователь</h2>
      <p>Рада, что вы заглянули в детали</p>
    </motion.aside>
  )
}
