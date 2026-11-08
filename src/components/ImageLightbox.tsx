import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CaseImage } from '../data/portfolio'
import { Icon } from './Icon'
import { SceneImage } from './SceneImage'

export function ImageLightbox({ image, onClose }: { image: CaseImage | null; onClose: () => void }) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!image) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [image, onClose])

  if (!image) return null
  return createPortal(
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-labelledby={titleId}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <h2 className="sr-only" id={titleId}>{image.caption}</h2>
      <div className="image-lightbox-toolbar">
        <div className="image-lightbox-zoom" aria-label="Масштаб изображения">
          <button type="button" onClick={() => setZoom(value => Math.max(1, value - .25))}
            disabled={zoom <= 1} aria-label="Уменьшить изображение">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => setZoom(value => Math.min(2, value + .25))}
            disabled={zoom >= 2} aria-label="Увеличить изображение">+</button>
        </div>
        <button className="image-lightbox-close" ref={closeRef} type="button" onClick={onClose}
          aria-label="Закрыть изображение"><Icon name="close" /></button>
      </div>
      <div className="image-lightbox-viewport">
        <SceneImage src={image.src} sizes="100vw" alt={image.alt} width={image.width} height={image.height}
          decoding="async" style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? '100%' : 'none' }} />
      </div>
    </div>,
    document.body,
  )
}
