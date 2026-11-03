import type { ImgHTMLAttributes } from 'react'

type SceneImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  avifSrcSet?: string
  webpSrcSet?: string
}

/** Keep lazy images visible to the browser's loading heuristics. The static
 * parent mask owns clipping; the gallery figure owns its Framer Motion reveal. */
export function SceneImage({ avifSrcSet, webpSrcSet, sizes, ...props }: SceneImageProps) {
  if (!avifSrcSet && !webpSrcSet) return <img sizes={sizes} {...props} />
  return <picture>
    {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
    {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
    <img sizes={sizes} {...props} />
  </picture>
}
