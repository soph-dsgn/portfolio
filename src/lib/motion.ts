import { useReducedMotion, type Variants } from 'framer-motion'
import { useSyncExternalStore } from 'react'

export const motionTokens = {
  ease: [.22, 1, .36, 1] as [number, number, number, number],
  easeFloat: 'easeInOut' as const,
  interaction: { type: 'spring' as const, stiffness: 450, damping: 34 },
  cursor: { stiffness: 450, damping: 38 },
  press: { type: 'spring' as const, stiffness: 550, damping: 38 },
  reveal: .45, adaptiveReveal: .5, menu: .2, stagger: .06,
  metric: .42, metricStagger: .07, mediaAssembly: .55, mediaAssemblyMobile: .45,
  navState: .18,
  micro: .16, hover: .22, reduced: .1, loaderExit: .18,
  caption: .25, captionDelay: .18, artwork: .5, scroll: .65,
  staggerSmall: .04, staggerAdaptive: .03, groupDelay: .1,
  assemblyStagger: .025, maxRevealDelay: .24,
  signature: {
    scene: { distance: 12, mobileDistance: 5, duration: .6, mobileDuration: .48, stagger: .032, mobileStagger: .025, scale: .985, opacity: .92 },
    portal: { pressDuration: .09, pressScale: .99, duration: .25, entryDuration: .35, scale: 1.025, mobileScale: 1.015, entryScale: .975, entryOpacity: .88, entryY: 8 },
    concept: { duration: .4, inactiveScale: .982, distantScale: .975, mobileScale: .99, inactiveOpacity: .84, distantOpacity: .79, mobileOpacity: .92, blur: 1, distantBlur: 1.5 },
    type: { duration: 8, minimum: .996, maximum: 1.006, returnScale: 1.003, opacity: [1, .92, 1, .96, 1] },
    metrics: { desktopScale: .9, mobileScale: .9, desktopY: 14, groupStagger: .11, captionStart: .16, valueDuration: .36, captionDuration: .25 },
    title: { duration: .55, deckDelay: .1 },
    media: { duration: .5, y: 18, scale: .985 },
    parallax: { distance: 8 },
  },
  mobile: {
    entrance: .5, distance: 16, groupStagger: .065, captionDelay: .08, toolsDelay: .32,
    media: { duration: .5, y: 16, conceptY: 14, captionY: 6, conceptCaptionY: 8, scale: .98, opacity: .88 },
    hero: { greeting: 8, title: 18, secondary: 14, actions: 10, photoY: 16, photoScale: .97 },
    about: { statement: 16, background: 10 }, contact: { headline: 16, actions: 10, signature: 12, scale: .98 },
    card: { captionY: 12, scale: .975, opacity: .9 },
    metrics: { y: 12, stagger: .09 }, tools: { y: 6, stagger: .025 },
    menu: { duration: .22, exit: .16, y: -8, itemY: -4, stagger: .03 },
    tapScale: .985, diagram: { step: .22, connectorStart: .13, connectorDuration: .12 },
  },
  float: { trophy: 5.2, sparkles: [4.6, 5.1, 5.6], stagger: .25 },
  // Diagram sequencing is shared by every desktop pattern and the mobile stack.
  diagram: { source: .22, wireStart: .24, wire: .3, targetStart: .66, node: .35, stagger: .035, maxNodeDelay: .14, wireStagger: .025, maxWireDelay: .1, mobileStagger: .07, mobileDelay: .04, maxMobileDelay: .32, maxMobileWireDelay: .28, filter: .35, filterStart: .16, filterStateStart: .38, filterResultStart: .7 },
}

const subscribeAdaptive = (update: () => void) => {
  const query = window.matchMedia('(max-width: 1100px)')
  query.addEventListener('change', update)
  return () => query.removeEventListener('change', update)
}
const subscribeHover = (update: () => void) => {
  const query = window.matchMedia('(hover: hover) and (pointer: fine)')
  query.addEventListener('change', update)
  return () => query.removeEventListener('change', update)
}
export type RevealPreset = 'soft' | 'left' | 'right' | 'scale' | 'fade'
export function revealTransform(preset: RevealPreset, distance = 16) {
  const x = preset === 'left' ? -distance : preset === 'right' ? distance : 0
  const y = preset === 'soft' ? distance : 0
  return `translate3d(${x}px, ${y}px, 0px) scale(${preset === 'scale' ? .98 : 1})`
}

export function revealIdentity(_preset: RevealPreset) {
  return 'translate3d(0px, 0px, 0px) scale(1)'
}

export function useMotionSystem() {
  const reduced = Boolean(useReducedMotion())
  const adaptive = useSyncExternalStore(subscribeAdaptive, () => window.matchMedia('(max-width: 1100px)').matches, () => false)
  const hover = useSyncExternalStore(subscribeHover, () => window.matchMedia('(hover: hover) and (pointer: fine)').matches, () => false)
  const transition = { duration: reduced ? motionTokens.reduced : adaptive ? motionTokens.adaptiveReveal : motionTokens.reveal, ease: motionTokens.ease }
  const variants = (preset: RevealPreset = 'soft', delay = 0): Variants => ({
    hidden: { opacity: 0, transform: reduced ? revealIdentity(preset) : adaptive ? `translate3d(0px, ${preset === 'fade' ? 0 : motionTokens.mobile.distance}px, 0px) scale(1)` : revealTransform(preset, 16) },
    visible: { opacity: 1, transform: revealIdentity(preset), transition: { ...transition, delay: reduced ? 0 : delay } },
  })
  const mobileEntrance = (y = motionTokens.mobile.distance, scale = 1, opacity = 0): Variants => ({
    hidden: { opacity, transform: reduced ? revealIdentity('soft') : `translate3d(0px, ${y}px, 0px) scale(${scale})` },
    visible: { opacity: 1, transform: revealIdentity('soft'), transition: { duration: reduced ? motionTokens.reduced : motionTokens.mobile.entrance, ease: motionTokens.ease } },
  })
  const mobileGroup = (stagger = motionTokens.mobile.groupStagger, delay = 0): Variants => ({ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: reduced ? 0 : delay } } })
  const staggerGroup: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : adaptive ? motionTokens.staggerAdaptive : motionTokens.stagger, delayChildren: reduced ? 0 : motionTokens.groupDelay } } }
  const opacityVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition } }
  const reveal = (preset: RevealPreset = 'soft', delay = 0) => ({
    initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: .04 }, variants: variants(preset, delay),
  })
  const navInteraction = {
    style: { transform: 'translate3d(0px, 0px, 0px) scale(1)' },
    whileHover: hover && !reduced ? { transform: 'translate3d(0px, -1px, 0px) scale(1)' } : undefined,
    whileTap: !reduced ? { transform: 'translate3d(0px, 0px, 0px) scale(.97)' } : undefined,
    transition: reduced ? { duration: 0 } : motionTokens.interaction,
  }
  const hoverLift = {
    style: { transform: 'translate3d(0px, 0px, 0px) scale(1)' },
    whileHover: hover && !reduced ? { transform: 'translate3d(0px, -2px, 0px) scale(1.03)' } : undefined,
    whileTap: !reduced ? { transform: 'translate3d(0px, 0px, 0px) scale(.97)' } : undefined,
    transition: reduced ? { duration: 0 } : motionTokens.interaction,
  }
  const metricGroupVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : adaptive ? motionTokens.mobile.metrics.stagger : motionTokens.signature.metrics.groupStagger } } }
  const metricItemVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : motionTokens.signature.metrics.captionStart } } }
  const metricVariants = (): Variants => ({
    hidden: { opacity: 0, transform: reduced ? 'none' : `translate3d(0px, ${adaptive ? motionTokens.mobile.metrics.y : motionTokens.signature.metrics.desktopY}px, 0px) scale(${adaptive ? motionTokens.signature.metrics.mobileScale : motionTokens.signature.metrics.desktopScale})` },
    visible: { opacity: 1, transform: 'translate3d(0px, 0px, 0px) scale(1)', transition: { duration: reduced ? motionTokens.reduced : motionTokens.signature.metrics.valueDuration, ease: motionTokens.ease } },
  })
  const metricCaptionVariants = (): Variants => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reduced ? motionTokens.reduced : motionTokens.signature.metrics.captionDuration, ease: motionTokens.ease } },
  })
  return { reduced, adaptive, hover, mobileEntrance, mobileGroup, variants, reveal, hoverLift, navInteraction, transition, staggerGroup, opacityVariants, metricGroupVariants, metricItemVariants, metricVariants, metricCaptionVariants }
}

// First-document reveals must not finish behind the initial loader. All scenes
// share this one readiness subscription; client navigation never resets it.
const interfaceListeners = new Set<() => void>()
const interfaceReady = () => !document.getElementById('root')?.hasAttribute('data-initial-loading')
const announceInterface = () => {
  if (!interfaceReady()) return
  document.removeEventListener('initial-ui-ready', announceInterface)
  interfaceListeners.forEach(listener => listener())
  interfaceListeners.clear()
}
const subscribeInterface = (listener: () => void) => {
  if (interfaceReady()) return () => {}
  interfaceListeners.add(listener)
  if (interfaceListeners.size === 1) document.addEventListener('initial-ui-ready', announceInterface)
  return () => {
    interfaceListeners.delete(listener)
    if (!interfaceListeners.size) document.removeEventListener('initial-ui-ready', announceInterface)
  }
}
export function useInterfaceReady() {
  return useSyncExternalStore(subscribeInterface, interfaceReady, () => false)
}
