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
    }}>{english ? 'Decline' : 'Отклонить'}</button>
    <button type="button" aria-pressed={consent === 'allow'} onClick={() => setAnalyticsConsent('allow')}>
      {english ? 'Allow analytics' : 'Разрешить аналитику'}
    </button>
  </div>
  return banner ? <aside className="privacy-banner" aria-label={title}>
    <p>{english ? 'May I use analytics to understand how you use this portfolio?' : 'Разрешите аналитику, чтобы я могла понять, как вы пользуетесь портфолио?'} <Link to="/copyright#privacy">{title}</Link></p>
    {controls}
  </aside> : <section className="privacy-settings" id="privacy" aria-labelledby="privacy-title">
    <h2 id="privacy-title">{title}</h2><p>{description}</p>{controls}
  </section>
}
