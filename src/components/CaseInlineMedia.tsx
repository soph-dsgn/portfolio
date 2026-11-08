import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties, UIEvent } from 'react'
import type { CaseImage } from '../data/portfolio'
import type { CaseMediaPlacement } from '../data/caseMedia'
import { motionTokens } from '../lib/motion'
import { BeforeAfter } from './BeforeAfter'
import { ImageLightbox } from './ImageLightbox'
import { SceneImage } from './SceneImage'

function MediaItem({ image, onOpen }: { image: CaseImage; onOpen: () => void }) {
  return <figure className="case-inline-media-item">
    <button type="button" className="case-inline-media-open" onClick={onOpen}
      aria-label={`Открыть изображение в полном размере: ${image.caption}`}>
      <SceneImage src={image.src} srcSet={image.srcSet} avifSrcSet={image.avifSrcSet} webpSrcSet={image.webpSrcSet}
        sizes="(min-width: 1201px) 1120px, (min-width: 761px) calc(100vw - 96px), calc(100vw - 48px)"
        alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
    </button>
  </figure>
}

export function CaseInlineMedia({ placement }: { placement: CaseMediaPlacement }) {
  const reduced = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const targetIndex = useRef<number | null>(null)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<CaseImage | null>(null)
  const hasPages = placement.images.length > 1

  if (placement.layout === 'before-after' && placement.images.length >= 2) return <>
    <motion.div className="case-inline-media case-inline-media--before-after"
      initial={reduced ? false : { opacity: motionTokens.signature.media.opacity, y: motionTokens.signature.media.y }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }}
      transition={{ duration: reduced ? motionTokens.reduced : motionTokens.adaptiveReveal, ease: motionTokens.ease }}>
      <BeforeAfter before={placement.images[0]} after={placement.images[1]} onOpen={setLightbox} />
    </motion.div>
    <ImageLightbox key={lightbox?.src ?? 'closed'} image={lightbox} onClose={() => setLightbox(null)} />
  </>

  const updateActive = (event: UIEvent<HTMLDivElement>) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    const node = event.currentTarget
    frame.current = requestAnimationFrame(() => {
      const width = node.clientWidth || 1
      const next = Math.max(0, Math.min(placement.images.length - 1, Math.round(node.scrollLeft / width)))
      if (targetIndex.current !== null) {
        const targetLeft = targetIndex.current * width
        if (Math.abs(node.scrollLeft - targetLeft) <= 1) {
          setActive(targetIndex.current)
          targetIndex.current = null
        }
        return
      }
      setActive(next)
    })
  }
  const goTo = (index: number) => {
    targetIndex.current = index
    setActive(index)
    track.current?.scrollTo({ left: index * (track.current?.clientWidth ?? 0), behavior: reduced ? 'auto' : 'smooth' })
  }

  return <>
    <motion.div className={`case-inline-media case-inline-media--${placement.layout}`}
      initial={reduced ? false : { opacity: motionTokens.signature.media.opacity, y: motionTokens.signature.media.y }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }}
      transition={{ duration: reduced ? motionTokens.reduced : motionTokens.adaptiveReveal, ease: motionTokens.ease }}>
      <div className="case-inline-media-track" ref={track} onScroll={updateActive}
        onPointerDown={() => { targetIndex.current = null }} onWheel={() => { targetIndex.current = null }}>
        {placement.images.map(image => <MediaItem key={image.src} image={image} onOpen={() => setLightbox(image)} />)}
      </div>
      {hasPages ? <nav className="case-inline-pagination" aria-label="Изображения блока"
        style={{ '--pagination-index': active } as CSSProperties}>
        <span className="case-inline-pagination-active" aria-hidden="true" />
        {placement.images.map((image, index) => <button key={image.src} type="button"
          aria-label={`Показать изображение ${index + 1} из ${placement.images.length}`}
          aria-current={active === index ? 'step' : undefined} onClick={() => goTo(index)}><span /></button>)}
      </nav> : null}
    </motion.div>
    <ImageLightbox key={lightbox?.src ?? 'closed'} image={lightbox} onClose={() => setLightbox(null)} />
  </>
}
