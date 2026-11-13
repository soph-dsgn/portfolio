import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/locale'
import { consentEvent, getAnalyticsConsent, setAnalyticsConsent } from '../lib/analyticsConsent'

function subscribe(update: () => void) {
  window.addEventListener(consentEvent, update)
  return () => window.removeEventListener(consentEvent, update)
}

export function PrivacySettings({ banner = false }: { banner?: boolean }) {
  const { locale } = useLocale()
  const consent = useSyncExternalStore(subscribe, getAnalyticsConsent)
  const english = locale === 'en'
  const title = english ? 'Privacy' : 'Конфиденциальность'
  if (banner && consent !== null) return null
  const controls = <div className="privacy-actions">
    <button type="button" aria-pressed={consent === 'deny'} onClick={() => {
      setAnalyticsConsent('deny')
      if (consent === 'allow' && import.meta.env.PROD) window.location.reload()
    }} title={english ? 'No trackers' : 'Без трекеров'}>{english ? 'Decline' : 'Отклонить'}</button>
    <button type="button" aria-pressed={consent === 'allow'} onClick={() => setAnalyticsConsent('allow')} title={english ? 'Turn analytics on' : 'Включить аналитику'}>
      {english ? 'Accept' : 'Принять'}
    </button>
  </div>
  // Banner copy is the author's: a joke headline, the reason in one line, the policy linked from «слежки».
  return banner ? <aside className="privacy-banner" aria-label={title} aria-describedby="privacy-banner-text">
    <p className="privacy-banner-title">{english
      ? <>A little <Link to="/privacy" title="Privacy and cookie policy">tracking</Link>, but only for UX 👀</>
      : <>Немного <Link to="/privacy" title="Политика конфиденциальности и использования файлов cookie">слежки</Link>, но только ради UX 👀</>}</p>
    <p id="privacy-banner-text">{english ? 'Metrica and Clarity show me where the site works and where it needs fixing' : 'Метрика и Clarity помогают понять, где сайт ок, а где надо чинить'}</p>
    {controls}
  </aside> : <InlineChoice consent={consent} english={english} />
}

/** Policy page: one line in the document's own voice that shows the current choice and flips it. */
function InlineChoice({ consent, english }: { consent: ReturnType<typeof getAnalyticsConsent>; english: boolean }) {
  const turnOff = () => {
    const wasOn = consent === 'allow'
    setAnalyticsConsent('deny')
    // Scripts already on the page stay until a reload; production reloads so tracking stops at once.
    if (wasOn && import.meta.env.PROD) window.location.reload()
  }
  const turnOn = () => setAnalyticsConsent('allow')
  const state = consent === 'allow'
    ? (english ? 'Analytics is on for you now' : 'Сейчас у вас аналитика включена')
    : consent === 'deny'
      ? (english ? 'Analytics is off for you now' : 'Сейчас у вас аналитика выключена')
      : (english ? 'You haven’t chosen yet, so analytics is off' : 'Вы ещё не сделали выбор, поэтому аналитика выключена')
  return <p className="privacy-inline" id="privacy" aria-live="polite">
    {state}{'\u00a0·'} {consent === 'allow'
      ? <button type="button" onClick={turnOff}>{english ? 'Turn off' : 'Выключить'}</button>
      : <button type="button" onClick={turnOn}>{english ? 'Turn on' : 'Включить'}</button>}
  </p>
}
