import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { projects } from '../data/portfolio'
import { trackEvent, trackPageView } from '../lib/analytics'
import { consentEvent, getAnalyticsConsent } from '../lib/analyticsConsent'

const caseIds = new Set(projects.map((project) => project.id))
const scrollMilestones = new Map<string, Set<number>>()

export function usePageTracking() {
  const { pathname } = useLocation()

  useEffect(() => {
    const track = () => {
      // Route paths are enough for pageviews; never forward arbitrary query data or hashes.
      const pageUrl = `${window.location.origin}${window.location.pathname}`
      if (!trackPageView(pathname, pageUrl)) return
      const slug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1]
      if (slug && caseIds.has(slug)) trackEvent('project_open', { project: slug })
    }
    track()
    window.addEventListener(consentEvent, track)
    return () => window.removeEventListener(consentEvent, track)
  }, [pathname])
}

export function useCaseScrollTracking() {
  const { pathname, key } = useLocation()
  const slug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1]
  const project = slug && caseIds.has(slug) ? slug : null

  useEffect(() => {
    if (!project) return
    const viewKey = `${key}:${project}`
    let sent = scrollMilestones.get(viewKey)
    if (!sent) {
      sent = new Set<number>()
      scrollMilestones.set(viewKey, sent)
    }
    const milestones = sent
    let frame = 0

    const check = () => {
      frame = 0
      if (getAnalyticsConsent() !== 'allow') return
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const depth = window.scrollY / scrollable
      for (const threshold of [50, 90] as const) {
        if (depth < threshold / 100 || milestones.has(threshold)) continue
        milestones.add(threshold)
        trackEvent(`case_scroll_${threshold}`, { project })
      }
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener(consentEvent, schedule)
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener(consentEvent, schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [key, project])
}
