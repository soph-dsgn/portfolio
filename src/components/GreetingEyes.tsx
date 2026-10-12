import { useEffect, useId, useRef } from 'react'
import { motion, useMotionTemplate, useReducedMotion, useSpring } from 'framer-motion'
import { motionTokens } from '../lib/motion'

/** One bounded gaze vector for both pupils; the eye outlines never move. */
export function GreetingEyes() {
  const ref = useRef<SVGSVGElement>(null)
  const clipId = useId()
  const reduced = useReducedMotion()
  const x = useSpring(0, motionTokens.cursor)
  const y = useSpring(0, motionTokens.cursor)
  const transform = useMotionTemplate`translate(${x}px, ${y}px)`

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    let pointer: { x: number; y: number } | null = null
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      pointer = null
      x.set(0)
      y.set(0)
    }
    const update = () => {
      frame = 0
      const bounds = ref.current?.getBoundingClientRect()
      if (!bounds || !pointer || !bounds.width || !bounds.height) return
      const dx = pointer.x - (bounds.left + bounds.width / 2)
      const dy = pointer.y - (bounds.top + bounds.height / 2)
      // Normalize in viewport space, then constrain to a safe ellipse in SVG units.
      const distance = Math.hypot(dx, dy)
      const strength = Math.min(distance / 120, 1)
      x.set(distance ? dx / distance * strength * 3 : 0)
      y.set(distance ? dy / distance * strength * 6 : 0)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) return
      pointer = { x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(update)
    }
    if (reduced) {
      x.jump(0)
      y.jump(0)
      return
    }
    const syncTracking = () => {
      window.removeEventListener('pointermove', move)
      reset()
      if (finePointer.matches) window.addEventListener('pointermove', move, { passive: true })
      else { x.jump(0); y.jump(0) }
    }
    syncTracking()
    window.addEventListener('blur', reset)
    document.documentElement.addEventListener('pointerleave', reset)
    finePointer.addEventListener('change', syncTracking)
    return () => {
      reset()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.documentElement.removeEventListener('pointerleave', reset)
      finePointer.removeEventListener('change', syncTracking)
    }
  }, [reduced, x, y])

  return <svg ref={ref} className="greeting-eyes" viewBox="0 0 42 28" width="42" height="28" aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}>
      <ellipse cx="10" cy="14" rx="7" ry="11" />
      <ellipse cx="32" cy="14" rx="7" ry="11" />
    </clipPath></defs>
    <g fill="var(--color-white)" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="10" cy="14" rx="8" ry="12" />
      <ellipse cx="32" cy="14" rx="8" ry="12" />
    </g>
    <g clipPath={`url(#${clipId})`}>
      <motion.g style={{ transform }} fill="currentColor">
        <circle cx="10" cy="14" r="3.3" />
        <circle cx="32" cy="14" r="3.3" />
      </motion.g>
    </g>
  </svg>
}
