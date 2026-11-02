import { useSyncExternalStore } from 'react'

export const homeSectionIds = ['concepts', 'about', 'partner-portal', 'contacts'] as const

export type HomeSectionId = typeof homeSectionIds[number]

let activeSection: HomeSectionId | '' = ''
const listeners = new Set<() => void>()

export function setHomeActiveSection(section: HomeSectionId | '') {
  if (activeSection === section) return
  activeSection = section
  listeners.forEach(listener => listener())
}

export function useHomeActiveSection() {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => activeSection,
    () => '',
  )
}
