type Consent = 'allow' | 'deny'
const key = 'portfolio.analytics-consent'
let choice: Consent | null = null
try {
  const saved = localStorage.getItem(key)
  if (saved === 'allow' || saved === 'deny') choice = saved
} catch { /* Consent stays off when storage is unavailable. */ }

export const getAnalyticsConsent = () => choice
export const consentEvent = 'portfolio-analytics-consent'

export function setAnalyticsConsent(next: Consent) {
  choice = next
  try { localStorage.setItem(key, next) } catch { /* Keep the choice in memory. */ }
  window.dispatchEvent(new Event(consentEvent))
}
