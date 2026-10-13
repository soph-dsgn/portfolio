import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { animate } from 'framer-motion'
import { motionTokens, revealTransform, revealIdentity } from '../lib/motion'

type RevealKind = 'intro' | 'avatar' | 'logo' | 'card' | 'image' | 'case-cover' | 'text' | 'table' | 'accordion-row' | 'case-intro' | 'fact' | 'result' | 'award-art' | 'award-text'

const revealKind = (block: HTMLElement) => (block.dataset.reveal ?? 'text') as RevealKind
const orderOf = (block: HTMLElement) => Number(block.dataset.revealOrder ?? 0)

// Reveals use compositor-only properties; the small marker observes the start
// of tall content without adding a grid item or changing document geometry.
export function ScrollReveals() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observed = new Map<Element, HTMLElement>()
    const targetsByBlock = new Map<HTMLElement, Element[]>()
    const markers: HTMLElement[] = []
    const pendingBlocks = new Set<HTMLElement>()
    const animations = new Map<HTMLElement, { stop: () => void }>()
    let observer: IntersectionObserver | undefined
    let firstFrame = 0
    let secondFrame = 0
    let passedFrame = 0
    let removePassed = () => {}

    const show = (block: HTMLElement, delay = 0, instant = false) => {
      if (instant) block.dataset.revealInstant = 'true'
      if (block.dataset.revealState === 'visible') return
      pendingBlocks.delete(block)
      block.style.setProperty('--reveal-delay', `${delay}ms`)
      block.dataset.revealState = 'visible'
      block.dataset.motionManaged = 'true'
      animations.get(block)?.stop()
      const kind = revealKind(block)
      const preset = ['image', 'case-cover', 'avatar'].includes(kind) ? 'scale'
        : kind === 'result' ? 'soft' : block.tagName === 'H2' ? 'fade' : 'soft'
      if (instant || media.matches) {
        block.style.opacity = '1'; block.style.transform = 'none'
      } else {
        const adaptive = window.matchMedia('(max-width: 1100px)').matches
        animations.set(block, animate(block, {
          opacity: [kind === 'image' && adaptive ? motionTokens.mobile.media.opacity : 0, 1], transform: kind === 'image' ? [`translateY(${adaptive ? motionTokens.mobile.media.y : motionTokens.signature.media.y}px) scale(${adaptive ? motionTokens.mobile.media.scale : motionTokens.signature.media.scale})`, 'translateY(0px) scale(1)'] : [revealTransform(preset, adaptive ? motionTokens.mobile.distance : 16), revealIdentity(preset)],
        }, { duration: kind === 'image' ? motionTokens.signature.media.duration : adaptive ? motionTokens.adaptiveReveal : motionTokens.reveal,
          delay: Math.min(delay / 1000, motionTokens.maxRevealDelay), ease: motionTokens.ease }))
      }
      targetsByBlock.get(block)?.forEach((target) => observer?.unobserve(target))
    }

    const revealTarget = (target: Element | null) => {
      if (!target) return
      const related = blocks.filter((block) =>
        block === target || block.contains(target) || target.contains(block),
      )
      related.forEach((block) => show(block, 0, true))
    }

    const start = () => {
      observer?.disconnect()
      animations.forEach(animation => animation.stop())
      blocks.filter(block => block.dataset.motionManaged && block.dataset.revealState === 'visible').forEach(block => { block.style.opacity = '1'; block.style.transform = 'none' })
      removePassed()
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      cancelAnimationFrame(passedFrame)
      markers.forEach((marker) => {
        marker.parentElement?.classList.remove('reveal-observe-anchor')
        marker.remove()
      })
      markers.length = 0
      observed.clear()
      targetsByBlock.clear()
      pendingBlocks.clear()

      if (media.matches || !('IntersectionObserver' in window)) {
        blocks.forEach((block) => show(block, 0, true))
        return
      }

      observer = new IntersectionObserver((entries) => {
        const entering = [...new Set(entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => observed.get(entry.target))
          .filter((block): block is HTMLElement => Boolean(block) && block?.dataset.revealState === 'pending'))]
        if (!entering.length) return

        const cards = entering.filter((block) => ['card', 'image'].includes(revealKind(block)))
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        let cardOrder = 0
        cards.forEach((block) => {
          // A fast jump can expose the middle of an earlier card. Stagger it
          // when it is still visible; only a fully departed card is skipped.
          const rect = block.getBoundingClientRect()
          show(block, rect.bottom <= 0 ? 0 : cardOrder++ * motionTokens.groupDelay * 1000)
        })

        for (const block of entering) {
          if (block.dataset.revealState !== 'pending') continue
          const kind = revealKind(block)
          const delay = kind === 'intro' ? orderOf(block) * motionTokens.metricStagger * 1000
            : kind === 'logo' ? orderOf(block) * motionTokens.staggerSmall * 1000
              : ['accordion-row', 'case-intro', 'fact', 'result', 'case-cover'].includes(kind) ? orderOf(block) * motionTokens.stagger * 1000
                : kind === 'award-text' ? orderOf(block) * motionTokens.metricStagger * 1000 : 0
          show(block, delay)
        }
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0 })

      // Large scroll jumps can skip the observer's entry window. Content that
      // has already passed the viewport must never remain invisible above it.
      const revealPassed = () => {
        passedFrame = 0
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
        for (const block of pendingBlocks) {
          const rect = block.getBoundingClientRect()
          if (rect.bottom <= 0) show(block, 0, true)
          else if (atPageEnd && rect.top < window.innerHeight && rect.bottom > 0) show(block)
        }
      }
      const schedulePassed = () => {
        if (!passedFrame) passedFrame = requestAnimationFrame(revealPassed)
      }
      window.addEventListener('scroll', schedulePassed, { passive: true })
      removePassed = () => window.removeEventListener('scroll', schedulePassed)
      schedulePassed()

      const target = document.getElementById(window.location.hash.slice(1))
      const positions = blocks.map((block) => ({
        block,
        rect: block.getBoundingClientRect(),
      }))
      const pending: HTMLElement[] = []
      for (const { block, rect } of positions) {
        if (block.dataset.revealState === 'visible') continue
        if (rect.bottom <= 0 || (target && (target === block || block.contains(target) || target.contains(block)))) {
          show(block, 0, true)
          continue
        }
        block.dataset.revealState = 'pending'
        pendingBlocks.add(block)
        pending.push(block)
      }

      // Two frames ensure the invisible start state is painted before motion.
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          for (const block of pending) {
            if (block.dataset.revealState !== 'pending') continue
            let target: Element = block
            const kind = revealKind(block)
            if (['card', 'image', 'case-cover', 'text', 'table'].includes(kind) &&
              block.getBoundingClientRect().height > window.innerHeight * 0.6) {
              const marker = document.createElement('span')
              marker.className = 'reveal-trigger'
              marker.setAttribute('aria-hidden', 'true')
              block.classList.add('reveal-observe-anchor')
              block.append(marker)
              markers.push(marker)
              target = marker
            }
            observed.set(target, block)
            targetsByBlock.set(block, [target])
            observer?.observe(target)
            if (target !== block) {
              observed.set(block, block)
              targetsByBlock.get(block)?.push(block)
              observer?.observe(block)
            }
          }
        })
      })
    }

    const revealFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const block = event.target.closest<HTMLElement>('[data-reveal]')
        if (block) show(block, 0, true)
      }
    }
    const revealAnchorClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link?.hash) return
      const url = new URL(link.href)
      if (url.origin === window.location.origin && url.pathname === window.location.pathname) {
        revealTarget(document.getElementById(decodeURIComponent(url.hash.slice(1))))
      }
    }
    const revealHash = () => revealTarget(document.getElementById(window.location.hash.slice(1)))

    start()
    media.addEventListener('change', start)
    document.addEventListener('focusin', revealFocus)
    document.addEventListener('click', revealAnchorClick, true)
    window.addEventListener('hashchange', revealHash)
    window.addEventListener('popstate', revealHash)

    return () => {
      animations.forEach(animation => animation.stop())
      observer?.disconnect()
      removePassed()
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      cancelAnimationFrame(passedFrame)
      markers.forEach((marker) => marker.remove())
      media.removeEventListener('change', start)
      document.removeEventListener('focusin', revealFocus)
      document.removeEventListener('click', revealAnchorClick, true)
      window.removeEventListener('hashchange', revealHash)
      window.removeEventListener('popstate', revealHash)
      blocks.forEach((block) => {
        block.classList.remove('reveal-observe-anchor')
        if (block.dataset.revealState === 'pending') delete block.dataset.revealState
      })
    }
  }, [pathname, search])

  return null
}
