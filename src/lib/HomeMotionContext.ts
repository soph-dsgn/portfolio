import { createContext } from 'react'

// Document-local, history-entry-scoped memory. Reload/new tabs start fresh.
const seenProjects = new Map<string, Set<string>>()
export function homeSeenProjects(entry: string) {
  let seen = seenProjects.get(entry)
  if (!seen) { seen = new Set(); seenProjects.set(entry, seen) }
  return seen
}
export function rememberHomeProject(entry: string, project: string) {
  homeSeenProjects(entry).add(project)
}
/** Snapshot visible neighbours before unmount, while native scroll is intact. */
export function rememberHomeProjectView(entry: string, source: HTMLElement) {
  const canvas = source.closest('.home-canvas')
  if (!canvas) return
  for (const card of canvas.querySelectorAll<HTMLElement>('[data-project]')) {
    const bounds = card.getBoundingClientRect()
    if (bounds.right > 0 && bounds.left < document.documentElement.clientWidth &&
      bounds.bottom > 0 && bounds.top < window.innerHeight)
      rememberHomeProject(entry, card.dataset.project!)
  }
}
export const HomeMotionContext = createContext<{
  restored: boolean
  ready: boolean
  entry: string
  seen: ReadonlySet<string>
} | null>(null)
