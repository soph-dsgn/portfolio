import { HomeMotionContext } from './HomeMotionContext'
import { useCallback, useContext, useEffect, useSyncExternalStore, type RefObject } from 'react'
import { useInView } from 'framer-motion'
import { useInterfaceReady, useMotionSystem } from './motion'

const entered = new WeakSet<HTMLElement>()
const listeners = new Set<() => void>()
const remember = (node: HTMLElement) => {
  if (entered.has(node)) return
  entered.add(node)
  listeners.forEach(update => update())
}

/** One seen latch across both layout modes; never reset/replay on resize.
 * Native intersection owns vertical pages; the measured canvas owns horizontal ones.
 */
export function useEntrance(ref: RefObject<HTMLElement | null>, amount = .12, canvasEvent = 'canvas-enter') {
  const { adaptive, reduced } = useMotionSystem()
  const home = useContext(HomeMotionContext)
  const ready = useInterfaceReady() && (!home || home.ready)
  const intersecting = useInView(ref, { amount })
  const subscribe = useCallback((update: () => void) => { listeners.add(update); return () => { listeners.delete(update) } }, [])
  const snapshot = useCallback(() => Boolean(ref.current && entered.has(ref.current)), [ref])
  const seen = useSyncExternalStore(subscribe, snapshot, () => false)
  useEffect(() => {
    const node = ref.current
    if (!node || seen || !ready) return
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
  }, [adaptive, reduced, ready, seen, intersecting, ref, canvasEvent])
  return reduced || seen
}
