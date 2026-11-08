import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import type { CaseImage } from '../data/portfolio'
import { SceneImage } from './SceneImage'

function Layer({ image }: { image: CaseImage }) {
  return <SceneImage src={image.src} srcSet={image.srcSet} avifSrcSet={image.avifSrcSet} webpSrcSet={image.webpSrcSet}
    sizes="(min-width: 1201px) 1120px, (min-width: 761px) calc(100vw - 96px), calc(100vw - 48px)"
    alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
}

export function BeforeAfter({ before, after, onOpen }: {
  before: CaseImage
  after: CaseImage
  onOpen: (image: CaseImage) => void
}) {
  const stage = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const moved = useRef(false)
  const positionRef = useRef(50)
  const [position, setPosition] = useState(50)

  const setFromClientX = (clientX: number) => {
    const rect = stage.current?.getBoundingClientRect()
    if (!rect?.width) return
    const next = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    positionRef.current = next
    setPosition(next)
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX
    moved.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    if (Math.abs(event.clientX - startX.current) > 4) moved.current = true
    if (moved.current) setFromClientX(event.clientX)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (moved.current) return
    const rect = stage.current?.getBoundingClientRect()
    if (!rect) return
    const clickPosition = ((event.clientX - rect.left) / rect.width) * 100
    onOpen(clickPosition <= positionRef.current ? before : after)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = positionRef.current
    if (event.key === 'ArrowLeft') next -= 5
    else if (event.key === 'ArrowRight') next += 5
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 100
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(positionRef.current < 50 ? before : after)
      return
    } else return
    event.preventDefault()
    positionRef.current = Math.max(0, Math.min(100, next))
    setPosition(positionRef.current)
  }

  return <div ref={stage} className="before-after" role="slider" tabIndex={0}
    aria-label="Сравнение AS IS и TO BE" aria-valuemin={0} aria-valuemax={100}
    aria-valuenow={Math.round(position)} aria-valuetext={`TO BE открыто на ${Math.round(position)}%`}
    style={{ '--before-after-position': `${position}%` } as CSSProperties}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
    onPointerCancel={() => { moved.current = false }} onKeyDown={onKeyDown}>
    <div className="before-after-layer before-after-layer--before"><Layer image={before} /></div>
    <div className="before-after-layer before-after-layer--after"><Layer image={after} /></div>
    <span className="before-after-divider" aria-hidden="true"><span>
      <svg viewBox="0 0 16 16" focusable="false">
        <path d="M3 8h10M5.5 5.5 3 8l2.5 2.5M10.5 5.5 13 8l-2.5 2.5" />
      </svg>
    </span></span>
  </div>
}
