import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { motionTokens } from '../lib/motion'
import { waitForPrimaryFont, waitForReactLayout } from '../lib/criticalReadiness'

const loaderFailSafe = 2500

function waitForHeroImage() {
  const image = document.querySelector<HTMLImageElement>('[data-lcp-image]')
  if (!image) return Promise.resolve()
  const loaded = image.complete
    ? Promise.resolve()
    : new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
    })
  return loaded.then(() => image.decode().catch(() => undefined))
}

/** One document bootstrap, outside the router: page navigation never restarts it. */
export function InitialLoader() {
  const [loading, setLoading] = useState(() => {
    const root = document.getElementById('root')
    return Boolean(root?.hasAttribute('data-initial-loading') && !root.hasAttribute('data-loader-failsafe'))
  })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!loading) return
    let cancelled = false
    let frame = 0
    const started = performance.now()
    let assemblyTimer = 0
    let finished = false
    const finish = () => {
      if (cancelled || finished) return
      finished = true
      window.clearTimeout(failSafe)
      document.getElementById('root')?.removeAttribute('data-initial-loading')
      document.dispatchEvent(new Event('initial-ui-ready'))
      setLoading(false)
    }
    // The loader is allowed to wait for the committed layout, the one font used
    // above the fold and the actual hero image. Canvas positioning and offscreen
    // media continue independently after the interface becomes interactive.
    const failSafe = window.setTimeout(finish, loaderFailSafe)
    void Promise.all([waitForReactLayout(), waitForPrimaryFont(), waitForHeroImage()]).then(() => {
      if (cancelled) return
      assemblyTimer = window.setTimeout(() => { frame = requestAnimationFrame(finish) },
        reduced ? 0 : Math.max(0, 420 - (performance.now() - started)))
    })
    return () => { cancelled = true; window.clearTimeout(failSafe); window.clearTimeout(assemblyTimer); cancelAnimationFrame(frame) }
  }, [loading, reduced])

  return <AnimatePresence>
    {loading && <motion.div className="initial-loader" key="initial-loader"
      role="status" aria-live="polite" initial={false} animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduced ? motionTokens.reduced : .42, ease: motionTokens.ease }}>
      <span className="sr-only">Минутку, расставляю всё по местам</span>
      <div className="opening-guides" aria-hidden="true"><i /><i /><i /></div>
    </motion.div>}
  </AnimatePresence>
}
