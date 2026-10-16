import { useContext, useLayoutEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { MediaStageContext } from '../lib/MediaStageContext'
import { useMotionSystem } from '../lib/motion'

/** Only case image content reveals; its parent SVG silhouette never animates.
 * Static CSS presentation scales (contained/multi-screen) remain untouched. */
export function SceneImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const visible = useContext(MediaStageContext)
  const { adaptive, mobileMask } = useMotionSystem()
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  useLayoutEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true)
  }, [props.src])
  // Lazy full-size case screens can arrive after intersection. Reveal actual
  // pixels, rather than finishing the animation while only the stage is visible.
  const waiting = adaptive && visible !== null && (!visible || !loaded)
  return <motion.img {...props as HTMLMotionProps<'img'>} ref={ref}
    onLoad={event => { setLoaded(true); props.onLoad?.(event) }}
    onError={event => { setLoaded(true); props.onError?.(event) }}
    initial={waiting ? 'hidden' : false}
    animate={waiting ? 'hidden' : 'visible'}
    variants={mobileMask()} />
}
