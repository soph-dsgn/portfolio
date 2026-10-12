import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/** The entire cover owns one continuous hover zone, including its caption and whitespace. */
export function CaseCursor({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const { reduced, adaptive, hover } = useMotionSystem()
  const tracking = hover && !adaptive && !reduced
  const visibleRef = useRef(false)
  const hide = () => { visibleRef.current = false; setVisible(false) }
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, motionTokens.cursor)
  const smoothY = useSpring(y, motionTokens.cursor)
  const position = useTransform(() => `translate3d(${reduced ? x.get() : smoothX.get()}px, ${reduced ? y.get() : smoothY.get()}px, 0)`)
  useEffect(() => {
    const reset = () => {
      visibleRef.current = false
      setVisible(false)
      x.jump(0); y.jump(0)
      smoothX.jump(0); smoothY.jump(0)
    }
    if (!tracking) reset()
    window.addEventListener('resize', reset)
    window.addEventListener('blur', reset)
    return () => { window.removeEventListener('resize', reset); window.removeEventListener('blur', reset) }
  }, [tracking, x, y, smoothX, smoothY])
  function follow(event: PointerEvent<HTMLDivElement>) {
    if (!tracking || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const left = Math.max(8, Math.min(event.clientX - bounds.left + 16, bounds.width - 152))
    const top = Math.max(8, Math.min(event.clientY - bounds.top + 16, bounds.height - 64))
    x.set(left); y.set(top)
    if (!visibleRef.current) {
      smoothX.jump(left); smoothY.jump(top)
      visibleRef.current = true
      setVisible(true)
    }
  }
  function cancel(event: PointerEvent<HTMLDivElement>) {
    // A cancelled gesture can still leave the mouse physically over the card.
    // Keep one hover zone until the pointer actually exits its bounds.
    if (event.pointerType === 'mouse' && event.currentTarget.matches(':hover')) return
    hide()
  }
  return <div className="case-cursor-surface" data-cursor={visible} onPointerEnter={tracking ? follow : undefined} onPointerMove={tracking ? follow : undefined} onPointerLeave={hide} onPointerCancel={cancel}>
    {children}
    <motion.span className="case-cursor" aria-hidden="true" style={{ transform: position }}>
      <motion.span initial={false} animate={{ opacity: visible ? 1 : 0, transform: reduced ? 'scale(1)' : `scale(${visible ? 1 : .94})` }} transition={{ duration: motionTokens.micro, ease: motionTokens.ease }}>Смотреть кейс</motion.span>
    </motion.span>
  </div>
}
