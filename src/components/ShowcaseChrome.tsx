import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data/portfolio'
import { useLocale } from '../i18n/locale'
import { trackEvent } from '../lib/analytics'
import { publicAsset } from '../lib/publicAsset'
import { Icon, type IconName } from './Icon'
import { MoscowTime } from './StoryChrome'
import { LanguageSelector } from './LanguageSelector'

/** Shared chrome of the showcase layout: settings, inner-page top bar, top fade and contact dock. */
export function ShowcaseSettings() {
  return <div className="sc-settings"><LanguageSelector /></div>
}

/** Inner pages: one way back on the left, settings on the right — the home page has no navigation either. */
export function ShowcaseTopBar({ to = '/', label = 'На главную' }: { to?: string; label?: string }) {
  const { t } = useLocale()
  return <header className="sc-topbar">
    <Link className="sc-back" to={to}><Icon name="arrow-left" /> {t(label)}</Link>
    <ShowcaseSettings />
  </header>
}

export function ShowcaseTopFade() {
  return <div className="sc-top-fade" aria-hidden="true" />
}

export function ShowcaseDock() {
  const { t } = useLocale()
  type DockLink = { id: IconName; label: string; href: string; external: boolean; track: () => void }
  const links: DockLink[] = [
    { id: 'telegram', label: 'Telegram', href: profile.telegram, external: true, track: () => { trackEvent('contact_click', { location: 'dock' }); trackEvent('telegram_click', { location: 'dock' }) } },
    // CV appears as soon as profile.cv points to a real file.
    ...(profile.cv ? [{ id: 'document' as const, label: t('Резюме'), href: profile.cv, external: true, track: () => trackEvent('resume_click', { location: 'dock' }) }] : []),
    { id: 'linkedin', label: 'LinkedIn', href: profile.linkedin, external: true, track: () => trackEvent('linkedin_click', { location: 'dock' }) },
    { id: 'mail', label: t('Почта'), href: profile.email, external: false, track: () => trackEvent('email_click', { location: 'dock' }) },
  ]
  return <nav className="sc-dock" aria-label={t('Контакты')}>
    {links.map(link => <a key={link.id} className="sc-dock-link" href={link.href} aria-label={link.label} title={link.label} onClick={link.track}
      {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <Icon name={link.id} />
    </a>)}
  </nav>
}

/** Snapshot cards fanned over the contact card: photos, concepts and a live Moscow-time note. */
const footerCards = [
  { id: 'photo', src: 'optimized/home/contact-portrait-480.webp', box: [0, 40, 270, 230], rotate: -6 },
  { id: 'uglycash', src: 'optimized/concepts/poster-1-1600.avif', box: [205, 125, 250, 200], rotate: 5 },
  { id: 'portal', src: 'optimized/home/partner-portal-art-640.webp', box: [420, 30, 300, 210], rotate: -4 },
  { id: 'time', box: [665, 60, 250, 220], rotate: 4 },
  { id: 'avatar', src: 'optimized/home/avatar-640.webp', box: [870, 115, 230, 250], rotate: -5 },
  { id: 'energy', src: 'optimized/concepts/poster-6-1600.avif', box: [1080, 35, 270, 220], rotate: 6 },
] as const

/** Site footer: fanned snapshots, a blue invitation card, then credits and legal links. Shared by every page. */
export function ShowcaseFooter({ location = 'footer', id }: { location?: string; id?: string }) {
  const { t, locale } = useLocale()
  const handle = '@' + profile.telegram.replace(/^https?:\/\/t\.me\//, '')
  const email = profile.email.replace(/^mailto:/, '')
  const telegram = () => { trackEvent('contact_click', { location }); trackEvent('telegram_click', { location }) }
  return <footer className="sc-site-footer" id={id}>
    <div className="sc-footer-photos" aria-hidden="true">
      {footerCards.map(card => {
        const [left, top, width, height] = card.box
        const style = { '--l': `${left / 13.6}%`, '--t': top, '--w': width, '--h': height, '--r': `${card.rotate}deg` } as CSSProperties
        return <figure className={`sc-snap${'src' in card ? '' : ' sc-snap--note'}`} key={card.id} style={style}>
          {'src' in card
            ? <img src={publicAsset(card.src)} alt="" loading="lazy" decoding="async" draggable={false} />
            : <div className="sc-snap-note"><span className="sc-snap-badge">{t('Сейчас в Москве')}</span><strong><MoscowTime /></strong></div>}
        </figure>
      })}
    </div>
    <div className="sc-footer-card">
      <h2 className="sc-footer-title">{t('Если дочитали до сюда\u00a0— давайте знакомиться')}</h2>
      <p className="sc-footer-line">{t('Пишите в Telegram:')} <a href={profile.telegram} target="_blank" rel="noreferrer" onClick={telegram}>{handle}</a></p>
      <p className="sc-footer-line">{t('Или на почту:')} <a href={profile.email} onClick={() => trackEvent('email_click', { location })}>{email}</a></p>
      <div className="sc-footer-actions">
        <a className="sc-footer-button" href={profile.telegram} target="_blank" rel="noreferrer" onClick={telegram}>{t('Написать в Telegram')}</a>
        <a className="sc-footer-button sc-footer-button--ghost" href={profile.linkedin} target="_blank" rel="noreferrer"
          onClick={() => trackEvent('linkedin_click', { location })}>LinkedIn ↗</a>
      </div>
    </div>
    <div className="sc-footer-bottom">
      <p className="sc-footer-credit">© 2026 · {t('Дизайнила и кодила')} {t(profile.name)}</p>
      <p className="sc-footer-legal">
        <Link to="/copyright">{t('Авторские права')}</Link>
        <Link to="/copyright#privacy">{locale === 'en' ? 'Privacy' : 'Конфиденциальность'}</Link>
      </p>
    </div>
  </footer>
}
