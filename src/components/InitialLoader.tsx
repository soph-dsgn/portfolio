import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { motionTokens } from '../lib/motion'

/** One document bootstrap, outside the router: page navigation never restarts it. */
export function InitialLoader() {
  const [loading, setLoading] = useState(true)
  const reduced = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    let frame = 0
    // Only visible images participate. Lazy case galleries and offscreen covers
    // must not delay the first screen, nor should the window's full load event.
    const firstPanel = document.querySelector('.home-canvas [data-canvas-panel]')
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('#root img'))
      .filter(image => {
        const panel = image.closest('[data-canvas-panel]')
        if (firstPanel && panel && panel !== firstPanel) return false
        const rect = image.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
          rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
      })
    // Home owns scroll positioning; don't expose a bootstrap frame before its
    // measured range and native position have been synchronized.
    const canvas = document.querySelector('.home-canvas')
    let observer: MutationObserver | undefined
    const positioned = !canvas || canvas.getAttribute('data-positioned') === 'true'
      ? Promise.resolve()
      : new Promise<void>(resolve => {
        observer = new MutationObserver(() => {
          if (canvas.getAttribute('data-positioned') !== 'true') return
          observer?.disconnect()
          resolve()
        })
        observer.observe(canvas, { attributes: true, attributeFilter: ['data-positioned'] })
      })
    const ready = [positioned, document.fonts.ready, ...images.map(image => image.decode().catch(() => undefined))]
    void Promise.all(ready).then(() => {
      if (cancelled) return
      // Let fonts/images and the canvas's ResizeObserver finish their layout.
      frame = requestAnimationFrame(() => {
        if (cancelled) return
        document.getElementById('root')?.removeAttribute('data-initial-loading')
        document.dispatchEvent(new Event('initial-ui-ready'))
        setLoading(false)
      })
    })
    return () => { cancelled = true; observer?.disconnect(); cancelAnimationFrame(frame) }
  }, [])

  return <AnimatePresence>
    {loading && <motion.div className="initial-loader" key="initial-loader"
      role="status" aria-live="polite" initial={false} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: reduced ? motionTokens.reduced : motionTokens.loaderExit, ease: motionTokens.ease }}>
      <p><span>Минутку, расставляю всё по местам</span><span className="loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
    </motion.div>}
  </AnimatePresence>
}
