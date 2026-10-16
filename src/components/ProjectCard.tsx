import { HomeMotionContext, rememberHomeProject, rememberHomeProjectView } from '../lib/HomeMotionContext'
import { SceneImage } from './SceneImage'
import { captureHomeScroll } from '../lib/pageScroll'
import { Link, useLocation } from 'react-router-dom'
import type { Project } from '../data/portfolio'
import { CaseCursor } from './CaseCursor'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode, RefObject } from 'react'
import { SceneSurface } from './SceneSurface'
import { ProjectCover } from './ProjectCover'
import { useEntrance } from '../lib/useEntrance'
import { motionTokens, revealIdentity, revealTransform, useMotionSystem } from '../lib/motion'
import { useArtworkParallax } from '../lib/useArtworkParallax'

const MotionLink = motion.create(Link)

const hoverQuery = '(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/** Layout measurements only decide whether contain leaves safe vertical room.
 * Scroll then flows directly through a MotionValue, never React state. */
function MobileArtworkProgression({ target, project, children }: { target: RefObject<HTMLElement | null>; project: Project; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { adaptive, reduced } = useMotionSystem()
  const [safe, setSafe] = useState(false)
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [motionTokens.mobile.card.drift, -motionTokens.mobile.card.drift])
  useLayoutEffect(() => {
    const node = ref.current
    const dimensions = project.coverDimensions
    if (!node || !dimensions || !adaptive || reduced) return
    const measure = () => {
      const imageHeight = Math.min(node.clientHeight, node.clientWidth * dimensions.height / dimensions.width)
      setSafe(node.clientHeight - imageHeight > motionTokens.mobile.card.drift * 2)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [adaptive, reduced, project])
  return <motion.div ref={ref} className="project-media project-media--progression" data-scroll-progression={adaptive && !reduced && safe} style={{ y: adaptive && !reduced && safe ? y : 0 }}>{children}</motion.div>
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const location = useLocation()
  const home = useContext(HomeMotionContext)
  const settled = Boolean(home?.restored && home.seen.has(project.id))
  const [pointerMovedFor, setPointerMovedFor] = useState<typeof location | null>(null)
  const pointerMovedAfterRestore = pointerMovedFor === location
  const restoreReady = !home?.restored || home.ready
  const pointerAllowed = restoreReady && (!home?.restored || pointerMovedAfterRestore)
  const reduced = useReducedMotion()
  const { adaptive, mobileMask } = useMotionSystem()
  const cardRef = useRef<HTMLElement>(null)
  const entered = useEntrance(cardRef)
  useEffect(() => {
    if (entered && home?.ready) rememberHomeProject(home.entry, project.id)
  }, [entered, home?.ready, home?.entry, project.id])
  const [hovered, setHovered] = useState(false)
  const [focusedFor, setFocusedFor] = useState<typeof location | null>(null)
  const focused = focusedFor === location
  const [interactive, setInteractive] = useState(() => window.matchMedia(hoverQuery).matches)
  const parallax = useArtworkParallax(interactive && !reduced && restoreReady)
  useEffect(() => {
    const media = window.matchMedia(hoverQuery)
    const update = () => { setInteractive(media.matches); setHovered(false) }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const revealed = !interactive || (pointerAllowed && hovered) || (restoreReady && focused)
  function settleHover(event: PointerEvent<HTMLAnchorElement>) {
    parallax.reset()
    if (event.pointerType !== 'mouse' || !event.currentTarget.matches(':hover')) setHovered(false)
  }
  return (
    <article ref={cardRef} className="project-card" data-canvas-panel data-project={project.id} data-restored-settled={settled || undefined}>
      <MotionLink
        className="project-link"
        whileTap={adaptive && !reduced ? { opacity: motionTokens.mobile.card.pressOpacity } : undefined}
        transition={{ duration: reduced ? 0 : motionTokens.micro }}
        draggable={false}
        to={`/projects/${project.id}`}
        state={{ homeEntryKey: location.key, portal: true }}
        onClick={event => {
          captureHomeScroll(location.key)
          rememberHomeProject(location.key, project.id)
          rememberHomeProjectView(location.key, event.currentTarget)
        }}
        aria-labelledby={`${project.id}-title`}
        data-reveal-details={interactive}
        onPointerEnter={event => { if (pointerAllowed && event.pointerType === 'mouse') setHovered(true) }}
        onMouseOver={() => { if (pointerAllowed && interactive) setHovered(true) }}
        onPointerMove={event => {
          if (home?.restored && !pointerMovedAfterRestore) {
            if (!home.ready || event.currentTarget.closest('.home-canvas')?.getAttribute('data-positioned') !== 'true' ||
              event.pointerType !== 'mouse' || (!event.movementX && !event.movementY)) return
            setPointerMovedFor(location)
            setHovered(true)
          }
          if (restoreReady) parallax.onPointerMove(event)
        }}
        onPointerLeave={() => { setHovered(false); parallax.reset() }}
        onMouseLeave={() => { setHovered(false); parallax.reset() }}
        onPointerCancel={settleHover}
        onFocus={event => { if (!home?.restored || event.currentTarget.matches(':focus-visible')) setFocusedFor(location) }}
        onBlur={() => setFocusedFor(null)}
      >
        <CaseCursor enabled={restoreReady} requirePointerMovement={Boolean(home?.restored && !pointerMovedAfterRestore)}>
          <SceneSurface single={project.id === 'skywallet' || project.id === 'astoria'} className="project-scene">
          <ProjectCover project={project} revealed={revealed} settled={settled} immediate={focused || !interactive || !pointerAllowed}>
          {project.cover ? (
              <motion.div className="project-media project-media--entrance" inherit={false}
                  initial={settled ? false : adaptive ? 'hidden' : reduced || !['skywallet', 'astoria'].includes(project.id) ? false : { opacity: 0, transform: revealTransform(index % 2 ? 'scale' : 'right') }}
                  animate={settled ? { opacity: 1, transform: revealIdentity('soft'), clipPath: motionTokens.mobile.mask.open } : adaptive ? entered ? 'visible' : 'hidden' : undefined}
                  variants={adaptive ? { hidden: { ...mobileMask().hidden, opacity: 1, transform: revealIdentity('soft') }, visible: { ...mobileMask().visible, opacity: 1, transform: revealIdentity('soft') } } : undefined}
                  whileInView={adaptive || settled ? undefined : { opacity: 1, transform: revealIdentity('soft'), clipPath: motionTokens.mobile.mask.open }} viewport={{ once: true, amount: .15 }}
                  transition={{ duration: settled ? 0 : reduced ? motionTokens.reduced : motionTokens.artwork, ease: motionTokens.ease }}>
                  <motion.div className="project-media project-media--parallax" inherit={false} style={parallax.style}>
                  <MobileArtworkProgression target={cardRef} project={project}><div className="project-artwork project-artwork--image">
                  <SceneImage
                    draggable={false}
                    src={project.cover}
                    srcSet={project.coverSrcSet}
                    sizes="(min-width: 1101px) 61vw, (min-width: 761px) calc(100vw - 48px), calc(100vw - 32px)"
                    alt=""
                    width={project.coverDimensions?.width}
                    height={project.coverDimensions?.height}
                    loading="lazy"
                    decoding="async"
                  />
                  </div></MobileArtworkProgression>
                  </motion.div>
              </motion.div>
          ) : (
            <div className="project-artwork project-artwork--pending" aria-hidden="true">
              <span>{project.title.split(' — ')[0]}</span>
            </div>
          )}
          </ProjectCover>
          </SceneSurface>
        </CaseCursor>
      </MotionLink>
    </article>
  )
}
