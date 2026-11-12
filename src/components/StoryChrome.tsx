import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { LanguageSelector } from './LanguageSelector'
import { profile } from '../data/portfolio'
import { useLocale } from '../i18n/locale'
import { trackEvent } from '../lib/analytics'
import { SoundControl } from '../lib/uiSound'
import { ShowcaseFooter } from './ShowcaseChrome'

const navigation = [
  ['Главная', '/'],
  ['Кейсы', '/#work'],
  ['Концепты', '/projects/concepts'],
  ['Контакты', '/#contacts'],
] as const

function StorySettings() {
  return <div className="story-settings"><LanguageSelector /><SoundControl /></div>
}

/** Name, primary navigation and settings — shared by every listing page. */
export function StoryHeader() {
  const { t } = useLocale()
  const { pathname } = useLocation()
  return <header className="story-header story-wrap">
    <Link to="/" className="story-logo">{t(profile.name)}</Link>
    <nav aria-label={t('Главная навигация')}>
      {navigation.map(([label, to]) => <Link key={to} to={to} aria-current={to === pathname ? 'page' : undefined}>{t(label)}</Link>)}
    </nav>
    <StorySettings />
  </header>
}

export function MoscowTime() {
  const { t, locale } = useLocale()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(clock)
  }, [])
  const formatted = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ru-RU', {
    timeZone: 'Europe/Moscow', hour: 'numeric', minute: '2-digit',
  }).format(now)
  return <>{formatted} · {t('Москва')}</>
}

export function StorySocial({ location }: { location: string }) {
  const { t } = useLocale()
  const telegram = () => { trackEvent('contact_click', { location }); trackEvent('telegram_click', { location }) }
  const resume = () => trackEvent('resume_click', { location })
  return <nav className="story-social" aria-label={t('Контакты')}>
    <a href={profile.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram" onClick={telegram}><Icon name="telegram" /></a>
    <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" onClick={() => trackEvent('linkedin_click', { location })}><Icon name="linkedin" /></a>
    <a href={profile.email} aria-label={t('Почта')} title={t('Почта')} onClick={() => trackEvent('email_click', { location })}><Icon name="mail" /></a>
    {profile.cv && <a href={profile.cv} aria-label={t('Резюме')} title={t('Резюме')} onClick={resume}><Icon name="document" /></a>}
  </nav>
}

export function StoryFooterRow({ location }: { location: string }) {
  const { t, locale } = useLocale()
  return <div className="story-finale-top">
    <div>
      <p>© 2026 {t(profile.name)}</p>
      <p><MoscowTime /> · <Link to="/copyright">{t('Авторские права')}</Link> · <Link to="/copyright#privacy">{locale === 'en' ? 'Privacy' : 'Конфиденциальность'}</Link></p>
    </div>
    <StorySocial location={location} />
  </div>
}

/** Footer for every page except home, which adds the skyline scene below the same row. */
export function StoryFooter({ location = 'footer' }: { location?: string }) {
  return <ShowcaseFooter location={location} />
}
