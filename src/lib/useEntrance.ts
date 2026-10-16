import { HomeMotionContext } from './HomeMotionContext'
import { useCallback, useContext, useEffect, useSyncExternalStore, type RefObject } from 'react'
import { useInView } from 'framer-motion'
import { useInterfaceReady, useMotionSystem } from './motion'

const entered = new WeakSet<HTMLElement>()
const listeners = new Set<() => void>()
// Document-local memory, scoped to a home history entry, never localStorage.
const homeEntrances = new Map<string, Set<string>>()
const remember = (node: HTMLElement) => {
  if (entered.has(node)) return
  entered.add(node)
  listeners.forEach(update => update())
}

/** One seen latch across both layout modes; never reset/replay on resize.
 * Native intersection owns vertical pages; the measured canvas owns horizontal ones.
 */
export function useEntrance(ref: RefObject<HTMLElement | null>, amount = .12, canvasEvent = 'canvas-enter', memoryKey?: string) {
  const { adaptive, reduced } = useMotionSystem()
  const home = useContext(HomeMotionContext)
  const ready = useInterfaceReady() && (!home || home.ready)
  const intersecting = useInView(ref, { amount })
  const subscribe = useCallback((update: () => void) => { listeners.add(update); return () => { listeners.delete(update) } }, [])
  const snapshot = useCallback(() => Boolean(ref.current && entered.has(ref.current)), [ref])
  const seen = useSyncExternalStore(subscribe, snapshot, () => false)
  const restored = Boolean(home?.restored && memoryKey && homeEntrances.get(home.entry)?.has(memoryKey))
  useEffect(() => {
    if (!home || !memoryKey || !seen) return
    let keys = homeEntrances.get(home.entry)
    if (!keys) { keys = new Set(); homeEntrances.set(home.entry, keys) }
    keys.add(memoryKey)
  }, [home, memoryKey, seen])
  useEffect(() => {
    const node = ref.current
    if (!node || seen) return
    if (restored) { remember(node); return }
    if (!ready) return
    const panel = node.closest<HTMLElement>('[data-canvas-panel]')
    const canvas = node.closest<HTMLElement>('.home-canvas')
    if (!canvas || adaptive || reduced) {
      if (intersecting) remember(node)
      return
    }
    const attribute = canvasEvent === 'canvas-visible' ? 'canvasMetricsVisible' : 'canvasVisible'
    const reveal = () => remember(node)
    if (panel?.dataset[attribute] === 'true') reveal()
    panel?.addEventListener(canvasEvent, reveal)
    return () => panel?.removeEventListener(canvasEvent, reveal)
  }, [adaptive, reduced, ready, seen, restored, intersecting, ref, canvasEvent])
  return reduced || seen || restored
}
