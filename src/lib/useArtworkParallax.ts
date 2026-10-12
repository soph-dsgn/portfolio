import { useEffect, useRef, type PointerEvent } from 'react'
import { useMotionTemplate, useSpring } from 'framer-motion'
import { motionTokens } from './motion'

/** Only artwork moves; hover reveal and the card's clipping remain independent. */
export function useArtworkParallax(enabled: boolean) {
  const x = useSpring(0, motionTokens.cursor)
  const y = useSpring(0, motionTokens.cursor)
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`
  const frame = useRef(0)
  const pointer = useRef<{ x: number; y: number; element: HTMLElement } | null>(null)
  const reset = () => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    pointer.current = null
    x.set(0)
    y.set(0)
  }
  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(frame.current)
      frame.current = 0
      pointer.current = null
      x.jump(0)
      y.jump(0)
    }
    return () => {
      cancelAnimationFrame(frame.current)
      frame.current = 0
      pointer.current = null
    }
  }, [enabled, x, y])
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType !== 'mouse') return
    pointer.current = { x: event.clientX, y: event.clientY, element: event.currentTarget }
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const point = pointer.current
      if (!point) return
      const rect = point.element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const clamp = (value: number) => Math.max(-1, Math.min(1, value))
      x.set(clamp((point.x - rect.left) / rect.width * 2 - 1) * 8)
      y.set(clamp((point.y - rect.top) / rect.height * 2 - 1) * 8)
    })
  }
  return { style: { transform }, onPointerMove, reset }
}
