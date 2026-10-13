import { motionTokens } from './motion'
/** Shared destination for both pagination tracking and native scroll navigation. */
export function canvasPanelOffset(panel: HTMLElement, track: HTMLElement) {
  const distance = Math.max(0, track.scrollWidth - document.documentElement.clientWidth)
  const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0
  return Math.max(0, Math.min(panel.offsetLeft - inset, distance))
}

/** Native vertical scroll coordinates for a panel on the horizontal home canvas. */
export function scrollToCanvasTarget(target: Element, behavior: ScrollBehavior = 'instant') {
  if (!target.isConnected) return false
  const canvas = target.closest<HTMLElement>('.home-canvas[data-horizontal="true"]')
  const track = canvas?.querySelector<HTMLElement>('.canvas-track')
  if (!canvas) return false
  if (!track) return true
  // Treat unready horizontal targets as handled, never fall through to an
  // incorrect vertical scrollIntoView-style destination.
  if (canvas.dataset.positioned !== 'true' && canvas.dataset.positioningPhase !== 'positioning') return true
  if (!track.scrollWidth || !document.documentElement.clientWidth) return true
  const panel = target.closest<HTMLElement>('[data-canvas-panel]') ?? target.querySelector<HTMLElement>('[data-canvas-panel]')
  const offset = panel ? canvasPanelOffset(panel, track) : 0
  const top = window.scrollY + canvas.getBoundingClientRect().top + offset
  scrollToPosition(top, behavior)
  return true
}

/** One navigation path for header anchors and pagination, on both layouts. */
export function navigateToSection(target: Element, behavior: ScrollBehavior = 'smooth') {
  if (!target.isConnected) return
  if (scrollToCanvasTarget(target, behavior)) return
  const bounds = target.getBoundingClientRect()
  if (!Number.isFinite(bounds.top) || bounds.width <= 0 || bounds.height <= 0) return
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
  scrollToPosition(window.scrollY + bounds.top - headerHeight - 16, behavior)
}
import { animate } from 'framer-motion'

let cancelNavigation: (() => void) | undefined

export function cancelSectionNavigation() {
  cancelNavigation?.()
}

function scrollToPosition(top: number, behavior: ScrollBehavior) {
  if (!Number.isFinite(top)) return
  cancelSectionNavigation()
  const destination = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight))
  if (behavior !== 'smooth' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: destination, behavior: 'instant' })
    return
  }
  const cleanup = () => {
    window.removeEventListener('wheel', interrupt)
    window.removeEventListener('touchstart', interrupt)
    window.removeEventListener('pointerdown', interrupt)
    window.removeEventListener('keydown', onKey)
    if (cancelNavigation === interrupt) cancelNavigation = undefined
  }
  const animation = animate(window.scrollY, destination, {
    duration: motionTokens.scroll,
    ease: motionTokens.ease,
    onUpdate: value => window.scrollTo({ top: value, behavior: 'instant' }),
    onComplete: cleanup,
  })
  function interrupt() { animation.stop(); cleanup() }
  function onKey(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) interrupt()
  }
  cancelNavigation = interrupt
  window.addEventListener('wheel', interrupt, { passive: true })
  window.addEventListener('touchstart', interrupt, { passive: true })
  window.addEventListener('pointerdown', interrupt, { passive: true })
  window.addEventListener('keydown', onKey)
}
