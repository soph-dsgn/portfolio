import type { ImgHTMLAttributes } from 'react'

/** Keep lazy images visible to the browser's loading heuristics. The static
 * parent mask owns clipping; the gallery figure owns its Framer Motion reveal. */
export function SceneImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} />
}
