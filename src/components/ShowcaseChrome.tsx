import { Link } from 'react-router-dom'
import { profile } from '../data/portfolio'
import { useLocale } from '../i18n/locale'
import { trackEvent } from '../lib/analytics'
import { Icon } from './Icon'

/** Shared chrome of the showcase layout: settings, inner-page top bar, top fade and contact dock. */
/** One pill showing the current language; a press switches to the other one. */
function LanguageToggle() {
  const { locale, setLocale } = useLocale()
  const next = locale === 'ru' ? 'en' : 'ru'
  return <button type="button" className="sc-lang" lang={next} data-sound-switch onClick={() => setLocale(next)}
    aria-label={next === 'en' ? 'Switch to English' : 'Переключить на русский'} title={next === 'en' ? 'English' : 'Русский'}>
    <span key={locale} className="home-localized-copy">{locale === 'ru' ? 'Ru' : 'En'}</span>
  </button>
}

export function ShowcaseSettings() {
  return <div className="sc-settings"><LanguageToggle /></div>
}

/** Inner pages: one way back on the left, settings on the right — the home page has no navigation either. */
export function ShowcaseTopBar({ to = '/', label = 'На главную' }: { to?: string; label?: string }) {
  const { t } = useLocale()
  return <header className="sc-topbar">
    <Link className="sc-back" to={to} aria-label={t(label)} title={t(label)}><Icon name="arrow-left" /></Link>
    <ShowcaseSettings />
  </header>
}

export function ShowcaseTopFade() {
  return <div className="sc-top-fade" aria-hidden="true" />
}

/* Filled glyphs with very soft corners for the dock; cut-outs use even-odd paths, so they work on any background. */
const dockIcons = {
  cv: 'M8.5 3h7A3.5 3.5 0 0 1 19 6.5v11a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 17.5v-11A3.5 3.5 0 0 1 8.5 3Zm.4 6.6a.9.9 0 0 0 0 1.8h6.2a.9.9 0 0 0 0-1.8H8.9Zm0 3.8a.9.9 0 0 0 0 1.8h3.8a.9.9 0 0 0 0-1.8H8.9Z',
  mail: 'M7 5h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Zm-.6 3.6a.9.9 0 0 0-1 1.4l6 4.5a1 1 0 0 0 1.2 0l6-4.5a.9.9 0 0 0-1-1.4L12 12.6 6.4 8.6Z',
  linkedin: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm.2 4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm0 3.4c-.7 0-1.2.5-1.2 1.2v4.2a1.2 1.2 0 0 0 2.4 0v-4.2c0-.7-.5-1.2-1.2-1.2Zm3.4 0c-.7 0-1.2.5-1.2 1.2v4.2a1.2 1.2 0 0 0 2.4 0v-1.8c0-1.1.9-1.5 1.6-1.5s1 .4 1 1.2v2.1a1.2 1.2 0 0 0 2.4 0v-2.3c0-1.9-1.1-3.1-2.8-3.1-.9 0-1.7.4-2.2 1-.1-.6-.6-1-1.2-1Z',
  telegram: 'M19.9 4.2c1-.4 2 .4 1.8 1.4l-2.4 12.7c-.2 1.1-1.5 1.6-2.4.9l-3.8-2.8-1.9 1.8c-.6.6-1.6.2-1.6-.6v-3.1l6.3-5.9c.3-.3-.1-.7-.4-.5l-7.8 4.9-3.2-1c-1.1-.4-1.2-1.9-.1-2.3l15.5-5.5Z',
}
function DockIcon({ name }: { name: keyof typeof dockIcons }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={dockIcons[name]} fill="currentColor" fillRule="evenodd" /></svg>
}

/** Contact dock: a frosted bar with CV, email and LinkedIn, and Telegram as its own primary block. */
export function ShowcaseDock() {
  const { t } = useLocale()
  const telegram = () => { trackEvent('contact_click', { location: 'dock' }); trackEvent('telegram_click', { location: 'dock' }) }
  return <nav className="sc-dock" aria-label={t('Контакты')}>
    <div className="sc-dock-group">
      {/* CV stays visible but inactive until profile.cv points to a real file; then it becomes a link. */}
      {profile.cv
        ? <a className="sc-dock-link" href={profile.cv} aria-label={t('Резюме')} target="_blank" rel="noreferrer" onClick={() => trackEvent('resume_click', { location: 'dock' })}><DockIcon name="cv" /><span>{t('Резюме')}</span></a>
        : <span className="sc-dock-link sc-dock-link--soon" title={`${t('Резюме')} — ${t('скоро')}`}><DockIcon name="cv" /><span>{t('Резюме')}</span><span className="sr-only"> — {t('скоро')}</span></span>}
      <a className="sc-dock-link" href={profile.email} aria-label={t('Почта')} onClick={() => trackEvent('email_click', { location: 'dock' })}><DockIcon name="mail" /><span>{t('Почта')}</span></a>
      <a className="sc-dock-link" href={profile.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer" onClick={() => trackEvent('linkedin_click', { location: 'dock' })}><DockIcon name="linkedin" /><span>LinkedIn</span></a>
    </div>
    <a className="sc-dock-group sc-dock-link sc-dock-telegram" href={profile.telegram} target="_blank" rel="noreferrer" onClick={telegram}>
      <DockIcon name="telegram" /><span>{t('Телеграм')}</span>
    </a>
  </nav>
}

/** Plain text footer: an invitation with contact links on one side, credits and legal links below. Shared by every page. */
/** Quiet closing line: copyright and authorship on the left, a back-to-top pill on the right. Contacts live in the dock. */
export function ShowcaseFooter({ id }: { location?: string; id?: string }) {
  const { t } = useLocale()
  const top = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }
  return <footer className="sc-site-footer" id={id}>
    <div className="sc-footer-note">
      <p>© 2026, {t('Дизайнила Софья Стрельченко')}</p>
      <p className="sc-footer-links">
        <Link className="sc-footer-legal" to="/copyright">{t('Авторские права')}</Link>
        <Link className="sc-footer-legal" to="/privacy">{t('Политика конфиденциальности')}</Link>
      </p>
    </div>
    <button type="button" className="sc-footer-top" onClick={top}>
      {t('Только наверх')}
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 16V4m-5 5 5-5 5 5" /></svg>
    </button>
  </footer>
}
