import { useEffect, useRef, type PointerEvent } from 'react'
import { useSpring } from 'framer-motion'
import { motionTokens } from './motion'

/** Only artwork moves; hover reveal and the card's clipping remain independent. */
export function useArtworkParallax(enabled: boolean) {
  const x = useSpring(0, motionTokens.cursor)
  const y = useSpring(0, motionTokens.cursor)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const reset = () => {
    pointer.current = null
    x.set(0)
    y.set(0)
  }
  useEffect(() => {
    if (!enabled) {
      pointer.current = null
      x.jump(0)
      y.jump(0)
    }
    return () => {
      pointer.current = null
    }
  }, [enabled, x, y])
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType !== 'mouse') return
    // Scroll/layout can retarget the pointer without any physical mouse movement.
    // Only new viewport coordinates may drive this local artwork translation.
    if (pointer.current?.x === event.clientX && pointer.current.y === event.clientY) return
    pointer.current = { x: event.clientX, y: event.clientY }
    // Sample point and bounds together, before the horizontal canvas advances.
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    x.set(clamp((event.clientX - rect.left) / rect.width * 2 - 1) * motionTokens.signature.parallax.distance)
    y.set(clamp((event.clientY - rect.top) / rect.height * 2 - 1) * motionTokens.signature.parallax.distance)
  }
  return { style: { x, y }, onPointerMove, reset }
}
