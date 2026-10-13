import { profile } from '../data/portfolio'
import { trackEvent } from '../lib/analytics'
import { Icon } from './Icon'
import { motion } from 'framer-motion'
import { publicAsset } from '../lib/publicAsset'
import { useMotionSystem } from '../lib/motion'

export function TelegramLink({ location, compact = false, label = 'Написать в Telegram', showIcon = true }: { location: string; compact?: boolean; label?: string; showIcon?: boolean }) {
  const { hoverLift, navInteraction } = useMotionSystem()
  const press = location === 'header' || location === 'mobile-header' ? navInteraction : hoverLift
  return <motion.a {...press} className={`button telegram-link${compact ? ' telegram-link--compact' : ''}`} href={profile.telegram} target="_blank" rel="noreferrer"
    aria-label="Написать в Telegram" onClick={() => {
      trackEvent('contact_click', { location })
      trackEvent('telegram_click', { location })
    }}>{showIcon && <Icon name="telegram" />}<span>{label}</span></motion.a>
}

export function ContactLinks({ location, resume = true }: { location: string; resume?: boolean }) {
  return <nav className="contact-links" aria-label="Профили и контакты">
    {resume && profile.cv && <a href={profile.cv} target="_blank" rel="noreferrer" onClick={() => trackEvent('resume_click', { location })}><Icon name="document" />Резюме</a>}
    <a href={profile.linkedin} target="_blank" rel="noreferrer" onClick={() => trackEvent('linkedin_click', { location })}><Icon name="linkedin" />LinkedIn</a>
    <a href={profile.email} onClick={() => trackEvent('email_click', { location })}><Icon name="mail" />Почта</a>
  </nav>
}

export function SocialIconLinks({ location, first = 'telegram' }: { location: string; first?: 'telegram' | 'hh' }) {
  const { hoverLift, staggerGroup, opacityVariants } = useMotionSystem()
  const interaction = { ...hoverLift, whileHover: hoverLift.whileHover ? { transform: 'translate3d(0px, -3px, 0px) scale(1.06)' } : undefined }
  return <motion.nav initial={location === 'hero' || location === 'contacts' ? undefined : 'hidden'} whileInView={location === 'hero' || location === 'contacts' ? undefined : 'visible'} viewport={{ once: true, amount: .1 }} variants={staggerGroup} className="social-icon-links" aria-label="Социальные сети и почта">
    {first === 'hh' ? <motion.a {...interaction} variants={opacityVariants} className="social-icon-link social-icon-link--hh" href={profile.hh} aria-disabled={!profile.hh || undefined} target="_blank" rel="noreferrer" aria-label="Резюме на HH.ru" title="HH.ru"
      onClick={profile.hh ? () => trackEvent('resume_click', { location, source: 'hh' }) : undefined}><img src={publicAsset('hh-logo.svg')} alt="" width="56" height="56" loading="lazy" decoding="async" /></motion.a> : <motion.a {...interaction} variants={opacityVariants} className="social-icon-link social-icon-link--telegram" href={profile.telegram} target="_blank" rel="noreferrer" aria-label="Написать в Telegram" title="Telegram"
      onClick={() => {
        trackEvent('contact_click', { location })
        trackEvent('telegram_click', { location })
      }}><Icon name="telegram" /></motion.a>}
    <motion.a {...interaction} variants={opacityVariants} className="social-icon-link social-icon-link--linkedin" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"
      onClick={() => trackEvent('linkedin_click', { location })}><Icon name="linkedin" /></motion.a>
    <motion.a {...interaction} variants={opacityVariants} className="social-icon-link social-icon-link--email" href={profile.email} aria-label="Написать на почту" title="Почта"
      onClick={() => trackEvent('email_click', { location })}><Icon name="mail" /></motion.a>
  </motion.nav>
}
