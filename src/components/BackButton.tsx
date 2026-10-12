import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowIcon } from './ArrowIcon'
import { useMotionSystem } from '../lib/motion'

const MotionLink = motion.create(Link)

export function BackButton({ to = '/#work' }: { to?: string }) {
  const { navInteraction: press } = useMotionSystem()
  return <MotionLink {...press} className="button back-button" to={to} aria-label="Назад"
    whileHover={press.whileHover ? { ...press.whileHover, backgroundColor: 'var(--color-surface)' } : undefined}>
    <ArrowIcon direction="left" decorative /><span className="back-button-label">Назад</span>
  </MotionLink>
}
