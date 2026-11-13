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
  const description = english
    ? 'With your permission, Yandex Metrica and Microsoft Clarity collect usage data, including page visits and interactions. You can change your choice here at any time.'
    : 'С вашего разрешения Яндекс Метрика и Microsoft Clarity собирают данные об использовании сайта, в том числе о просмотрах страниц и взаимодействиях. Вы можете изменить выбор здесь в любой момент.'
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
  </aside> : <section className="privacy-settings" id="privacy" aria-labelledby="privacy-title">
    <h2 id="privacy-title">{title}</h2><p>{description}</p>{controls}
  </section>
}
