import { savedPageScroll } from '../lib/pageScroll'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowIcon } from './ArrowIcon'
import { useMotionSystem } from '../lib/motion'

const MotionLink = motion.create(Link)

export function BackButton({ to = '/#work' }: { to?: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const homeKey = (location.state as { homeEntryKey?: string } | null)?.homeEntryKey
  const { navInteraction: press } = useMotionSystem()
  return <MotionLink {...press} className="button back-button" to={to} aria-label="Назад"
    onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (homeKey && savedPageScroll(homeKey) !== undefined) {
        event.preventDefault()
        navigate(-1)
      }
    }}
    whileHover={press.whileHover ? { ...press.whileHover, backgroundColor: 'var(--color-surface)' } : undefined}>
    <ArrowIcon direction="left" decorative /><span className="back-button-label">Назад</span>
  </MotionLink>
}
