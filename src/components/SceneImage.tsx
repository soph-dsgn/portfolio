import { useContext, useLayoutEffect, useRef, useState, type ImgHTMLAttributes, type CSSProperties } from 'react'
import { motion, type Variants } from 'framer-motion'
import { SceneMotionContext } from '../lib/SceneMotionContext'
import { motionTokens, useMotionSystem } from '../lib/motion'

type Frame = { src: string; left: number; top: number; width: number; height: number; fit: string; position: string; radius: string }
const quadrants = [
  { x: -1, y: -1, clip: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' },
  { x: 1, y: -1, clip: 'polygon(50% 0, 100% 0, 100% 50%, 50% 50%)' },
  { x: -1, y: 1, clip: 'polygon(0 50%, 50% 50%, 50% 100%, 0 100%)' },
  { x: 1, y: 1, clip: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' },
]

/** Four temporary visual slices; the original image fills seams and owns semantics.
 * Slices live inside the same artwork parent, so existing hover/parallax applies
 * to both. No cloned captions, DOM ids, controls or live video elements.
 */
export function SceneImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { reveal, opening } = useContext(SceneMotionContext)
  const { adaptive, reduced } = useMotionSystem()
  const image = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [finished, setFinished] = useState(false)
  const [frame, setFrame] = useState<Frame | null>(null)
  const assembling = reveal && loaded && !finished && !reduced
  const active = assembling || opening
  const amplitude = adaptive ? motionTokens.signature.scene.mobileDistance : motionTokens.signature.scene.distance
  useLayoutEffect(() => {
    if (image.current?.complete && image.current.naturalWidth) setLoaded(true)
  }, [props.src])
  useLayoutEffect(() => {
    const img = image.current
    const parent = img?.parentElement
    if (!active || !img || !parent) return
    const measure = () => {
      const bounds = parent.getBoundingClientRect()
      const rect = img.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      // Remove ancestor transform scaling; retain the image's own presentation.
      const sx = parent.offsetWidth / bounds.width
      const sy = parent.offsetHeight / bounds.height
      const style = getComputedStyle(img)
      setFrame({ src: img.currentSrc || img.src,
        left: (rect.left - bounds.left) * sx, top: (rect.top - bounds.top) * sy,
        width: rect.width * sx, height: rect.height * sy,
        fit: style.objectFit, position: style.objectPosition, radius: style.borderRadius })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [active, props.src])
  const parts: Variants = {
    hidden: (index: number) => ({ transform: `translate3d(${quadrants[index].x * (assembling ? amplitude : 0)}px, ${quadrants[index].y * (assembling ? amplitude : 0)}px, 0) scale(${assembling ? motionTokens.signature.scene.scale : 1})`, opacity: assembling ? motionTokens.signature.scene.opacity : 1 }),
    visible: (index: number) => ({ transform: `translate3d(${quadrants[index].x * (opening ? motionTokens.signature.scene.portalDistance : 0)}px, ${quadrants[index].y * (opening ? motionTokens.signature.scene.portalDistance : 0)}px, 0) scale(1)`, opacity: 1,
      transition: { duration: opening ? motionTokens.signature.portal.duration : adaptive ? motionTokens.signature.scene.mobileDuration : motionTokens.signature.scene.duration, delay: opening ? 0 : index * (adaptive ? motionTokens.signature.scene.mobileStagger : motionTokens.signature.scene.stagger), ease: motionTokens.ease } }),
  }
  return <>
    <img {...props} ref={image} data-scene-image={finished ? 'assembled' : assembling ? 'assembling' : 'waiting'}
      onLoad={event => { setLoaded(true); props.onLoad?.(event) }} />
    {active && frame && <div className="scene-image-parts" aria-hidden="true">
      {quadrants.map((part, index) => <div key={index} className="scene-image-quadrant" style={{ clipPath: part.clip }}>
        <motion.div className="scene-image-slice"
          custom={index} variants={parts} initial="hidden" animate="visible"
          onAnimationComplete={() => { if (index === quadrants.length - 1 && !opening) setFinished(true) }}>
          <img src={frame.src} alt="" draggable={false} decoding="async" style={{ position: 'absolute', left: frame.left, top: frame.top,
            width: frame.width, height: frame.height, maxWidth: 'none', maxHeight: 'none', objectFit: frame.fit as CSSProperties['objectFit'], objectPosition: frame.position,
            borderRadius: frame.radius, transform: 'none' }} />
        </motion.div>
      </div>)}
    </div>}
  </>
}
