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
      <h2>Любопытный исследователь</h2>
      <p>Вы получили ачивку за то, что заглянули в детали</p>
    </motion.aside>
  )
}
