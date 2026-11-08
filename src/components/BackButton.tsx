import { savedPageScroll } from '../lib/pageScroll'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowIcon } from './ArrowIcon'
import { useMotionSystem } from '../lib/motion'
import { useLocale } from '../i18n/locale'

export function BackButton({ to = '/' }: { to?: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLocale()
  const homeKey = (location.state as { homeEntryKey?: string } | null)?.homeEntryKey
  const { navInteraction: press } = useMotionSystem()
  return <motion.button {...press} type="button" className="button back-button" aria-label={t('Назад')}
    onClick={() => {
      const historyIndex = Number(window.history.state?.idx)
      if ((homeKey && savedPageScroll(homeKey) !== undefined) || (Number.isFinite(historyIndex) && historyIndex > 0)) {
        navigate(-1)
      } else {
        navigate(to, { replace: true })
      }
    }}
    whileHover={press.whileHover ? { ...press.whileHover, backgroundColor: 'var(--color-surface)' } : undefined}>
    <ArrowIcon direction="left" decorative />
  </motion.button>
}
