import { useSyncExternalStore } from 'react'

type Store = { subscribe: (listener: () => void) => () => void; snapshot: () => string }
const stores = new Map<string, Store>()

/** One scroll subscription and one stable video.id source for navigation/depth. */
function storeFor(ids: string[]): Store {
  const key = ids.join('|')
  const existing = stores.get(key)
  if (existing) return existing
  let active = ids[0] ?? ''
  let frame = 0
  let observer: ResizeObserver | undefined
  const listeners = new Set<() => void>()
  const update = () => {
    frame = 0
    const line = (document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0) + 36
    let next = ids[0] ?? ''
    for (const id of ids) {
      const target = document.getElementById(id)
      if (target && target.getBoundingClientRect().top <= line) next = id
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2)
      next = ids.at(-1) ?? next
    if (next === active) return
    active = next
    listeners.forEach(listener => listener())
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
  const store: Store = {
    snapshot: () => active,
    subscribe: listener => {
      listeners.add(listener)
      if (listeners.size === 1 && ids.length) {
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        const gallery = document.querySelector('.concept-gallery')
        if (gallery) { observer = new ResizeObserver(schedule); observer.observe(gallery) }
        schedule()
      }
      return () => {
        listeners.delete(listener)
        if (!listeners.size) {
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
          observer?.disconnect()
          observer = undefined
          cancelAnimationFrame(frame)
          frame = 0
          active = ids[0] ?? ''
        }
      }
    },
  }
  stores.set(key, store)
  return store
}
export function useActiveConcept(ids: string[]) {
  const store = storeFor(ids)
  return useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot)
}
