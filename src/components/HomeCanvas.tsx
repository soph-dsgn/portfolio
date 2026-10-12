import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useLocation, useNavigationType } from 'react-router-dom'
import { savedPageScroll } from '../lib/pageScroll'
import { ProfileContact, ProfileHero } from './ProfileSidebar'
import { Work } from '../sections/Work'
import { canvasPanelOffset, cancelSectionNavigation, navigateToSection, scrollToCanvasTarget } from '../lib/canvasNavigation'
import { useLocale } from '../i18n/locale'

type CanvasPanel = { element: HTMLElement; label: string; offset: number }

function nearestPanel(panels: CanvasPanel[], offset: number) {
  return panels.reduce((nearest, panel, index) =>
    Math.abs(panel.offset - offset) < Math.abs(panels[nearest].offset - offset) ? index : nearest, 0)
}

/** Scroll remains native: no wheel interception, artificial inertia or snapping. */
export function HomeCanvas() {
  const { locale } = useLocale()
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [horizontal, setHorizontal] = useState(() => window.matchMedia('(min-width: 1101px) and (prefers-reduced-motion: no-preference)').matches)
  const [height, setHeight] = useState<number>()
  const [activePanel, setActivePanel] = useState(0)
  const activePanelIndex = useRef(0)
  const [panels, setPanels] = useState<CanvasPanel[]>([])
  const panelPositions = useRef<CanvasPanel[]>([])
  const reduced = useReducedMotion()
  const location = useLocation()
  const navigationType = useNavigationType()
  const positioned = useRef<string | null>(null)
  const ready = useRef(false)
  const keyboardNavigation = useRef(false)
  const mountPosition = useRef(savedPageScroll(location.key))
  const distance = useMotionValue(0)
  const start = useMotionValue(0)
  const { scrollY } = useScroll()
  const offset = useMotionValue(0)
  // Pixel-for-pixel travel keeps native wheel, trackpad and keyboard scrolling.
  // Keep one MotionValue binding across breakpoints so an old horizontal
  // subscription cannot overwrite the vertical layout's transform.
  const transform = useTransform(offset, value => horizontal && !reduced ? `translate3d(${-value}px, 0, 0)` : 'none')
  const updateActivePanel = (index: number) => {
    if (activePanelIndex.current === index) return
    activePanelIndex.current = index
    setActivePanel(index)
  }
  const syncScroll = () => {
    if (!ready.current) return
    // Motion may deliver a queued pre-reset sample. The native position is authoritative.
    const travel = Math.max(0, Math.min(window.scrollY - start.get(), distance.get()))
    offset.set(travel)
    updateActivePanel(nearestPanel(panelPositions.current, travel))
  }
  useMotionValueEvent(scrollY, 'change', syncScroll)

  useLayoutEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Tab') keyboardNavigation.current = true }
    const onPointer = () => { keyboardNavigation.current = false }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onPointer) }
  }, [])

  useLayoutEffect(() => {
    const media = window.matchMedia('(min-width: 1101px) and (prefers-reduced-motion: no-preference)')
    const update = () => setHorizontal(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const element = track.current
    if (!element) return
    let frame = 0
    let confirmFrame = 0
    let interacted = false
    const needsPosition = positioned.current !== location.key
    const first = positioned.current === null
    // A fresh document has no saved entries. POP within this document still
    // restores its exact reading position; a new/reloaded home always starts at 0.
    const restored = navigationType === 'POP' && !location.hash
      ? first ? mountPosition.current : savedPageScroll(location.key)
      : undefined
    const resetHome = needsPosition && !location.hash && restored === undefined
    const measure = () => {
      const travel = horizontal ? Math.max(0, element.scrollWidth - document.documentElement.clientWidth) : 0
      start.set(window.scrollY + (root.current?.getBoundingClientRect().top ?? 0))
      distance.set(travel)
      const measured = Array.from(element.querySelectorAll<HTMLElement>('[data-canvas-panel]')).map(panel => {
        const heading = panel.querySelector<HTMLElement>('h1, h2')
        const label = panel.getAttribute('aria-label') ?? heading?.getAttribute('aria-label') ?? heading?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        return { element: panel, label, offset: canvasPanelOffset(panel, element) }
      })
      const destinations = measured.filter((_, index) =>
        index === 0 || index === Math.floor((measured.length - 1) / 2) || index === measured.length - 1)
      panelPositions.current = destinations
      setPanels(destinations)
      setHeight(horizontal ? travel + window.innerHeight : undefined)
    }
    const sync = () => {
      scrollY.set(window.scrollY)
      if (!ready.current) return
      const travel = Math.max(0, Math.min(window.scrollY - start.get(), distance.get()))
      offset.set(travel)
      updateActivePanel(nearestPanel(panelPositions.current, travel))
    }
    const position = (behavior: ScrollBehavior) => {
      if (restored !== undefined) window.scrollTo({ top: restored, behavior: 'instant' })
      else if (location.hash) {
        const target = document.getElementById(location.hash.slice(1))
        if (target) navigateToSection(target, behavior)
      } else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    let resizeFrame = 0
    const onResize = () => {
      if (!ready.current || resizeFrame) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        if (!ready.current) return
        measure()
        sync()
      })
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(element)
    window.addEventListener('resize', onResize)
    // Native fragment positioning may run after React's effects on a new document.
    // Reconcile once after load, unless the reader has already taken control.
    const markInteraction = () => { interacted = true }
    const onLoad = () => {
      confirmFrame = requestAnimationFrame(() => {
        if (!ready.current || interacted || positioned.current !== location.key) return
        position('instant')
        sync()
      })
    }
    if (needsPosition) {
      ready.current = false
      cancelSectionNavigation()
      offset.set(0)
      distance.set(0)
      updateActivePanel(0)
      if (resetHome) {
        window.history.scrollRestoration = 'manual'
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
      scrollY.set(window.scrollY)
      // Confirm reset before measuring. Commit the real page height before any
      // hash/restored position is applied, so the browser cannot clamp it early.
      frame = requestAnimationFrame(() => {
        if (resetHome) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        measure()
        frame = requestAnimationFrame(() => {
          measure()
          position(first || navigationType === 'POP' ? 'instant' : 'smooth')
          positioned.current = location.key
          ready.current = true
          sync()
        })
      })
      window.addEventListener('load', onLoad, { once: true })
      window.addEventListener('wheel', markInteraction, { passive: true })
      window.addEventListener('touchstart', markInteraction, { passive: true })
      window.addEventListener('pointerdown', markInteraction, { passive: true })
      window.addEventListener('keydown', markInteraction)
    } else {
      ready.current = true
      // Locale and viewport changes remeasure without resetting the reader.
      measure()
      sync()
    }
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(confirmFrame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('wheel', markInteraction)
      window.removeEventListener('touchstart', markInteraction)
      window.removeEventListener('pointerdown', markInteraction)
      window.removeEventListener('keydown', markInteraction)
      ready.current = false
    }
  }, [horizontal, location.hash, location.key, navigationType, distance, offset, scrollY, start, locale])

  return <main id="main-content" className="home-canvas" ref={root} tabIndex={-1}
    data-horizontal={horizontal} style={{ height }} onFocusCapture={event => {
      if (keyboardNavigation.current && ready.current && horizontal && event.target instanceof Element && event.target.closest('[data-canvas-panel]'))
        scrollToCanvasTarget(event.target)
    }}>
    <div className="canvas-viewport">
      <motion.div className="canvas-track" ref={track} style={{ transform }}>
        <ProfileHero />
        <Work />
        <ProfileContact homepage />
      </motion.div>
      {horizontal && <nav className="canvas-zone-indicator" aria-label="Экраны портфолио">
        {panels.map((panel, index) => <button key={index} type="button"
          aria-label={`Перейти к экрану ${index + 1}: ${panel.label}`}
          aria-current={activePanel === index ? 'step' : undefined}
          onClick={() => navigateToSection(panel.element, reduced ? 'instant' : 'smooth')}>
          <span aria-hidden="true" />
        </button>)}
      </nav>}
    </div>
  </main>
}
