import { getAnalyticsConsent } from './analyticsConsent'

const metrikaId = Number(import.meta.env.VITE_YANDEX_METRIKA_ID || '113354835')
const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID || 'yrw5j54ads'

export type AnalyticsEvent =
  | 'project_open'
  | 'contact_click'
  | 'telegram_click'
  | 'resume_click'
  | 'linkedin_click'
  | 'email_click'
  | 'case_scroll_50'
  | 'case_scroll_90'

type EventParams = Partial<Record<'project' | 'location' | 'source', string>>

let initialized = false
let previousPageUrl: string | null = null
let previousPagePath: string | null = null

function addScript(src: string) {
  if ([...document.scripts].some((script) => script.src === src)) return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  document.head.appendChild(script)
}

export function initAnalytics() {
  if (initialized) return
  initialized = true
  if (!import.meta.env.PROD) return

  if (!window.ym) {
    const queue: YandexMetrika = (...args: unknown[]) => {
      ;(queue.a ??= []).push(args)
    }
    queue.l = Date.now()
    window.ym = queue
  }
  window.ym(metrikaId, 'init', {
    defer: true,
    webvisor: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true,
  })
  addScript(`https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}`)

  if (!window.clarity) {
    const queue: MicrosoftClarity = (...args: unknown[]) => {
      ;(queue.q ??= []).push(args)
    }
    window.clarity = queue
  }
  addScript(`https://www.clarity.ms/tag/${clarityId}`)
}

// React StrictMode can rerun effects; only a changed route path is a new pageview.
export function trackPageView(path: string, url: string) {
  if (getAnalyticsConsent() !== 'allow') return false
  if (previousPagePath === path) return false
  initAnalytics()
  const referer = previousPageUrl ?? document.referrer
  previousPagePath = path
  previousPageUrl = url

  if (import.meta.env.PROD) {
    window.ym?.(metrikaId, 'hit', url, { title: document.title, referer })
    // Clarity observes browser history changes itself; no synthetic page event.
  }
  return true
}

export function trackEvent(name: AnalyticsEvent, params: EventParams) {
  if (getAnalyticsConsent() !== 'allow') return
  if (!import.meta.env.PROD) {
    console.info('[analytics]', name, params)
    return
  }
  initAnalytics()
  window.ym?.(metrikaId, 'reachGoal', name, params)
  window.clarity?.('event', name)
}
