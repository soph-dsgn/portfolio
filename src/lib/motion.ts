import { useReducedMotion, type Variants } from 'framer-motion'
import { useSyncExternalStore } from 'react'

export const motionTokens = {
  ease: [.22, 1, .36, 1] as [number, number, number, number],
  easeFloat: 'easeInOut' as const,
  interaction: { type: 'spring' as const, stiffness: 450, damping: 34 },
  cursor: { stiffness: 450, damping: 38 },
  press: { type: 'spring' as const, stiffness: 550, damping: 38 },
  reveal: .45, adaptiveReveal: .35, menu: .2, stagger: .06,
  metric: .42, metricStagger: .07, mediaAssembly: .55, mediaAssemblyMobile: .45,
  navState: .18,
  micro: .16, hover: .22, reduced: .1, loaderExit: .18,
  caption: .25, captionDelay: .18, artwork: .5, scroll: .65,
  staggerSmall: .04, staggerAdaptive: .03, groupDelay: .1, adaptiveDelayFactor: .65,
  assemblyStagger: .025, maxRevealDelay: .24,
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
  return preset === 'left' ? `translateX(-${distance}px)`
    : preset === 'right' ? `translateX(${distance}px)`
    : preset === 'scale' ? 'scale(.98)'
    : preset === 'fade' ? 'none' : `translateY(${distance}px)`
}

export function revealIdentity(preset: RevealPreset) {
  return preset === 'scale' ? 'scale(1)' : preset === 'left' || preset === 'right' ? 'translateX(0px)' : preset === 'fade' ? 'none' : 'translateY(0px)'
}

export function useMotionSystem() {
  const reduced = Boolean(useReducedMotion())
  const adaptive = useSyncExternalStore(subscribeAdaptive, () => window.matchMedia('(max-width: 1100px)').matches, () => false)
  const hover = useSyncExternalStore(subscribeHover, () => window.matchMedia('(hover: hover) and (pointer: fine)').matches, () => false)
  const transition = { duration: reduced ? motionTokens.reduced : adaptive ? motionTokens.adaptiveReveal : motionTokens.reveal, ease: motionTokens.ease }
  const variants = (preset: RevealPreset = 'soft', delay = 0): Variants => ({
    hidden: { opacity: 0, transform: reduced ? revealIdentity(preset) : revealTransform(preset, adaptive ? 8 : 16) },
    visible: { opacity: 1, transform: revealIdentity(preset), transition: { ...transition, delay: reduced ? 0 : delay * (adaptive ? motionTokens.adaptiveDelayFactor : 1) } },
  })
  const staggerGroup: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : adaptive ? motionTokens.staggerAdaptive : motionTokens.stagger, delayChildren: reduced ? 0 : motionTokens.groupDelay } } }
  const opacityVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition } }
  const reveal = (preset: RevealPreset = 'soft', delay = 0) => ({
    initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: .04 }, variants: variants(preset, delay),
  })
  const navInteraction = {
    style: { transform: 'translateY(0px) scale(1)' },
    whileHover: hover && !reduced ? { transform: 'translateY(-1px) scale(1)' } : undefined,
    whileTap: !reduced ? { transform: 'translateY(0px) scale(.97)' } : undefined,
    transition: reduced ? { duration: 0 } : motionTokens.interaction,
  }
  const hoverLift = {
    style: { transform: 'translateY(0px) scale(1)' },
    whileHover: hover && !reduced ? { transform: 'translateY(-2px) scale(1.03)' } : undefined,
    whileTap: !reduced ? { transform: 'translateY(0px) scale(.97)' } : undefined,
    transition: reduced ? { duration: 0 } : motionTokens.interaction,
  }
  const metricVariants = (index: number): Variants => ({
    hidden: { opacity: 0, transform: reduced ? 'scale(1)' : 'scale(.94)' },
    visible: { opacity: 1, transform: 'scale(1)', transition: {
      duration: reduced ? motionTokens.reduced : adaptive ? motionTokens.adaptiveReveal : motionTokens.metric,
      delay: reduced ? 0 : index * motionTokens.metricStagger, ease: motionTokens.ease,
    } },
  })
  const metricCaptionVariants = (index: number): Variants => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reduced ? motionTokens.reduced : motionTokens.caption,
      delay: reduced ? 0 : index * motionTokens.metricStagger + motionTokens.captionDelay, ease: motionTokens.ease } },
  })
  return { reduced, adaptive, hover, variants, reveal, hoverLift, navInteraction, transition, staggerGroup, opacityVariants, metricVariants, metricCaptionVariants }
}
