import { motionTokens } from '../lib/motion'
import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { bindShortWords } from '../lib/typography'
import { useLocale } from '../i18n/locale'

type Direction = 'right' | 'left' | 'up' | 'down' | 'up-right'

const directionByCharacter: Record<string, Direction> = {
  '→': 'right', '←': 'left', '↑': 'up', '↓': 'down', '↗': 'up-right',
}

const labelByDirection: Record<Direction, string> = {
  right: 'далее', left: 'назад', up: 'вверх', down: 'вниз', 'up-right': 'переход',
}

export function ArrowIcon({ direction = 'right', decorative = false, className = '' }: {
  direction?: Direction
  decorative?: boolean
  className?: string
}) {
  const reducedMotion = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (direction !== 'up-right') return
    const trigger = svgRef.current?.closest('a, button, [role="button"]')
    if (!trigger) return
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setActive(
      (finePointer.matches && trigger.matches(':hover')) || trigger.matches(':focus-visible'),
    )
    trigger.addEventListener('pointerenter', update)
    trigger.addEventListener('pointerleave', update)
    trigger.addEventListener('focusin', update)
    trigger.addEventListener('focusout', update)
    finePointer.addEventListener('change', update)
    update()
    return () => {
      trigger.removeEventListener('pointerenter', update)
      trigger.removeEventListener('pointerleave', update)
      trigger.removeEventListener('focusin', update)
      trigger.removeEventListener('focusout', update)
      finePointer.removeEventListener('change', update)
    }
  }, [direction])

  return (
    <svg
      ref={svgRef}
      className={`arrow-icon arrow-icon--${direction} ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : labelByDirection[direction]}
      focusable="false"
    >
      <motion.g className="arrow-icon-glyph"
        animate={direction === 'up-right' ? { transform: active && !reducedMotion ? 'rotate(45deg)' : 'rotate(0deg)' } : undefined}
        style={direction === 'up-right' ? { transformBox: 'view-box', transformOrigin: 'center' } : undefined}
        transition={{ duration: reducedMotion ? 0 : motionTokens.menu, ease: motionTokens.ease }}>
        <path
          d={direction === 'up-right' ? 'M4.5 19.5 19.5 4.5M8 4.5h11.5V16' : 'M3 12h18M14 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  )
}

export function InlineArrows({ text }: { text: string }) {
  const { t } = useLocale()
  return bindShortWords(t(text)).split(/([→←↑↓↗])/g).map((part, index) => {
    const direction = directionByCharacter[part]
    return <Fragment key={index}>{direction ? <ArrowIcon direction={direction} className="arrow-icon--inline" /> : part}</Fragment>
  })
}
