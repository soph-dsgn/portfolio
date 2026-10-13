import { flushSync } from 'react-dom'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useLocation, useNavigationType } from 'react-router-dom'
import { activateHomeScroll, captureHomeScroll, deactivateHomeScroll, savedPageScroll } from '../lib/pageScroll'
import { ProfileContact, ProfileHero } from './ProfileSidebar'
import { Work } from '../sections/Work'
import { canvasPanelOffset, cancelSectionNavigation, navigateToSection, scrollToCanvasTarget } from '../lib/canvasNavigation'
import { useLocale } from '../i18n/locale'

type CanvasPanel = { element: HTMLElement; label: string; offset: number }

function homeHashTarget(canvas: HTMLElement | null, hash: string) {
  if (!canvas || !hash) return null
  try {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    return target && canvas.contains(target) ? target : null
  } catch { return null } // Malformed/unknown fragments fall back to the root.
}

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
  const generation = useRef(0)
  const measureCurrent = useRef<(() => boolean) | null>(null)
  const keyboardNavigation = useRef(false)
  const aboutRevealed = useRef(false)
  const [initialization, setInitialization] = useState<{ entry: string; generation: number; restored?: number; hash: string; animateAnchor: boolean } | null>(null)
  const distance = useMotionValue(0)
  const start = useMotionValue(0)
  const offset = useMotionValue(0)
  // Pixel-for-pixel travel keeps native wheel, trackpad and keyboard scrolling.
  // Keep one MotionValue binding across breakpoints so an old horizontal
  // subscription cannot overwrite the vertical layout's transform.
  const transform = useTransform(offset, value => horizontal && !reduced ? `translate3d(${-value}px, 0, 0)` : 'none')
  const updateActivePanel = useCallback((index: number) => {
    if (activePanelIndex.current === index) return
    activePanelIndex.current = index
    setActivePanel(index)
  }, [])


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
    let resizeFrame = 0
    let cancelled = false
    let assetsReady = false
    const version = ++generation.current
    const current = () => !cancelled && generation.current === version
    const target = homeHashTarget(root.current, location.hash)
    const resolvedHash = target ? `#${target.id}` : ''
    const entry = `${location.key}:${location.hash}`
    const needsPosition = positioned.current !== entry
    const interactiveAnchor = needsPosition && navigationType === 'PUSH' && location.state?.animateAnchor === true && Boolean(target)
    const mountedAnchor = interactiveAnchor && location.state?.anchorOriginPath === '/' && positioned.current !== null
    const controller = new AbortController()
    const saved = navigationType === 'POP' && needsPosition && (!location.hash || target)
      ? savedPageScroll(location.key, location.hash) : undefined
    const restored = saved !== undefined && Number.isFinite(saved) && saved >= 0 ? saved : undefined
    let initialTop = mountedAnchor || !needsPosition ? window.scrollY : restored
    // The entry's native position is saved while this DOM still exists, never
    // in a router cleanup after a shorter case has clamped the scroll range.
    const about = element.querySelector<HTMLElement>('#about')
    let aboutBounds = { left: 0, width: 0 }
    const revealAbout = (travel: number) => {
      if (!horizontal || aboutRevealed.current || document.getElementById('root')?.hasAttribute('data-initial-loading')) return
      if (!about || !aboutBounds.width) return
      const left = aboutBounds.left - travel
      const visible = Math.max(0, Math.min(left + aboutBounds.width, document.documentElement.clientWidth) - Math.max(left, 0))
      if (visible / aboutBounds.width >= .6) {
        aboutRevealed.current = true
        about.dispatchEvent(new Event('canvas-visible'))
      }
    }
    const syncScroll = () => {
      if (!current() || !ready.current) return
      // Only the positioned entry can consume native scroll samples.
      const travel = Math.max(0, Math.min(window.scrollY - start.get(), distance.get()))
      offset.set(travel)
      revealAbout(travel)
      updateActivePanel(nearestPanel(panelPositions.current, travel))
    }
    const sync = () => {
      if (!current() || !ready.current) return
      syncScroll()
      captureHomeScroll(location.key)
    }
    const measure = () => {
      const canvas = root.current
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = window.innerHeight
      const bounds = canvas?.getBoundingClientRect()
      const panelElements = Array.from(element.querySelectorAll<HTMLElement>('[data-canvas-panel]'))
      if (!current() || !canvas?.isConnected || !element.isConnected || !bounds ||
        ![viewportWidth, viewportHeight, bounds.width, bounds.height, element.scrollWidth].every(value => Number.isFinite(value) && value > 0) ||
        !Number.isFinite(window.scrollY + bounds.top) || !panelElements.length ||
        panelElements.some(panel => !Number.isFinite(panel.offsetLeft) || panel.offsetWidth <= 0 || panel.offsetHeight <= 0)) return false
      if (about) aboutBounds = { left: about.offsetLeft, width: about.offsetWidth }
      const travel = horizontal ? Math.max(0, element.scrollWidth - document.documentElement.clientWidth) : 0
      start.set(window.scrollY + (root.current?.getBoundingClientRect().top ?? 0))
      distance.set(travel)
      const measured = panelElements.map(panel => {
        const heading = panel.querySelector<HTMLElement>('h1, h2')
        const label = panel.getAttribute('aria-label') ?? heading?.getAttribute('aria-label') ?? heading?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        return { element: panel, label, offset: canvasPanelOffset(panel, element) }
      })
      const destinations = measured.filter((_, index) =>
        index === 0 || index === Math.floor((measured.length - 1) / 2) || index === measured.length - 1)
      panelPositions.current = destinations
      setPanels(destinations)
      setHeight(horizontal ? travel + window.innerHeight : undefined)
      return true
    }
    measureCurrent.current = measure
    const invalidateMeasurement = () => {
      cancelled = true
      if (generation.current === version) generation.current++
      if (measureCurrent.current === measure) measureCurrent.current = null
    }
    const commitMeasurement = () => {
      if (!current() || !assetsReady) return
      root.current?.setAttribute('data-positioning-phase', 'measuring')
      flushSync(() => {
        if (!measure()) {
          root.current?.setAttribute('data-positioning-phase', 'waiting-for-layout')
          return
        }
        setInitialization({ entry, generation: version, restored: initialTop, hash: resolvedHash, animateAnchor: interactiveAnchor })
      })
    }
    const waitForLayout = () => {
      if (ready.current) initialTop = savedPageScroll(location.key, location.hash) ?? window.scrollY
      ready.current = false
      positioned.current = null
      deactivateHomeScroll(location.key)
      cancelSectionNavigation()
      root.current?.setAttribute('data-positioned', 'false')
      root.current?.setAttribute('data-positioning-phase', 'waiting-for-layout')
    }
    const onResize = () => {
      if (!current() || (!ready.current && !assetsReady) || resizeFrame) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        if (!current()) return
        if (!ready.current) commitMeasurement()
        else if (measure()) sync()
        else waitForLayout()
      })
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(element)
    const viewport = element.closest('.canvas-viewport')
    if (viewport) observer.observe(viewport)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', sync, { passive: true })
    document.addEventListener('initial-ui-ready', sync)
    if (needsPosition && mountedAnchor) {
      // Same-canvas clicks keep the native position/range. MobileHeader starts
      // the one shared tween after this router commit; bootstrap must not reset it.
      assetsReady = true
      if (measure()) {
        positioned.current = entry
        ready.current = true
        activateHomeScroll(location.key, location.hash)
        sync()
      } else {
        waitForLayout()
        // ResizeObserver commits when real geometry exists; never flush inside this effect.
      }
    } else if (needsPosition) {
      ready.current = false
      deactivateHomeScroll(location.key)
      root.current?.setAttribute('data-positioned', 'false')
      root.current?.setAttribute('data-positioning-phase', 'preparing')
      cancelSectionNavigation()
      offset.set(0)
      distance.set(0)
      updateActivePanel(0)
      window.history.scrollRestoration = 'manual'
      // Do not consume native or Motion scroll samples before the real range
      // exists. Fonts and the first image are the same bootstrap as the loader.
      if (restored === undefined && (!target || interactiveAnchor))
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      const images = Array.from(element.querySelectorAll<HTMLImageElement>('.profile-hero img'))
      // Native focus/restoration completes with document load/pageshow. Font
      // readiness alone can precede it; never enable tracking in that interval.
      const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve =>
        window.addEventListener('load', () => resolve(), { once: true, signal: controller.signal }))
      void Promise.all([loaded, document.fonts.ready, ...images.map(image => image.decode().catch(() => undefined))]).then(() => {
        if (!current()) return
        assetsReady = true
        // One layout boundary after document/fonts/images; no polling timeout.
        frame = requestAnimationFrame(() => {
          if (!current()) return
          if (restored === undefined && (!target || interactiveAnchor))
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
          commitMeasurement()
        })
      })
    } else {
      assetsReady = true
      ready.current = true
      activateHomeScroll(location.key, location.hash)
      if (measure()) sync()
      else waitForLayout()
    }
    return () => {
      invalidateMeasurement()
      controller.abort()
      ready.current = false
      deactivateHomeScroll(location.key)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', sync)
      document.removeEventListener('initial-ui-ready', sync)
    }
  }, [horizontal, location.hash, location.key, navigationType, distance, offset, start, locale, updateActivePanel, location.state?.animateAnchor, location.state?.anchorOriginPath])

  // This effect runs against React's committed scroll range. Bootstrap has one
  // owner: intent -> document/layout ready -> range commit -> native position ->
  // Motion values -> tracking. Loader waits for this final ready marker.
  useLayoutEffect(() => {
    const entry = `${location.key}:${location.hash}`
    if (!initialization || initialization.entry !== entry || initialization.generation !== generation.current || positioned.current === entry) return
    // Height/range now exist in the DOM. Remeasure against that committed layout
    // before consuming native scroll; a zero-size layout stays locked.
    if (!measureCurrent.current?.()) return
    const requiredHeight = distance.get() + window.innerHeight
    if (horizontal && (root.current!.getBoundingClientRect().height < requiredHeight - 1 ||
      document.documentElement.scrollHeight - window.innerHeight < start.get() + distance.get() - 1)) return
    root.current?.setAttribute('data-positioning-phase', 'positioning')
    if (initialization.restored !== undefined)
      window.scrollTo({ top: initialization.restored, left: 0, behavior: 'instant' })
    else if (initialization.hash && !initialization.animateAnchor) {
      const target = homeHashTarget(root.current, initialization.hash)
      if (target) navigateToSection(target, 'instant')
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const travel = Math.max(0, Math.min(window.scrollY - start.get(), distance.get()))
    offset.set(travel)
    updateActivePanel(nearestPanel(panelPositions.current, travel))
    positioned.current = entry
    activateHomeScroll(location.key, location.hash)
    ready.current = true
    captureHomeScroll(location.key)
    root.current?.setAttribute('data-positioning-phase', 'ready')
    root.current?.setAttribute('data-positioned', 'true')
    document.dispatchEvent(new Event('initial-ui-ready'))
    // Cross-route user clicks start at hero, with the committed native range
    // and tracking enabled. Direct URLs/POP use the instant branch above.
    if (initialization.animateAnchor) {
      const target = homeHashTarget(root.current, initialization.hash)
      if (target) {
        target.tabIndex = -1
        target.focus({ preventScroll: true })
        navigateToSection(target, reduced ? 'instant' : 'smooth')
      }
    }
  }, [initialization, height, horizontal, location.key, location.hash, start, distance, offset, updateActivePanel, reduced])

  return <main id="main-content" className="home-canvas" ref={root} tabIndex={-1}
    data-horizontal={horizontal} style={{ height, overflowAnchor: 'none' }} onFocusCapture={event => {
      if (keyboardNavigation.current && ready.current && horizontal && event.target instanceof Element && event.target.closest('[data-canvas-panel]') && !event.target.matches('[data-canvas-panel]'))
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
