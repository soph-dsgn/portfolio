import { HomeMotionContext, rememberHomeProject, rememberHomeProjectView } from '../lib/HomeMotionContext'
import { SceneImage } from './SceneImage'
import { captureHomeScroll } from '../lib/pageScroll'
import { Link, useLocation } from 'react-router-dom'
import type { Project } from '../data/portfolio'
import { CaseCursor } from './CaseCursor'
import { motion, useReducedMotion } from 'framer-motion'
import { useContext, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { SceneSurface } from './SceneSurface'
import { ProjectCover } from './ProjectCover'
import { useEntrance } from '../lib/useEntrance'
import { motionTokens, revealIdentity, revealTransform, useMotionSystem } from '../lib/motion'
import { useArtworkParallax } from '../lib/useArtworkParallax'

const MotionLink = motion.create(Link)

const hoverQuery = '(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const location = useLocation()
  const home = useContext(HomeMotionContext)
  const settled = Boolean(home?.restored && home.seen.has(project.id))
  const [pointerMovedFor, setPointerMovedFor] = useState<typeof location | null>(null)
  const pointerMovedAfterRestore = pointerMovedFor === location
  const restoreReady = !home?.restored || home.ready
  const pointerAllowed = restoreReady && (!home?.restored || pointerMovedAfterRestore)
  const reduced = useReducedMotion()
  const { adaptive, mobileEntrance } = useMotionSystem()
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
          <SceneSurface single={project.id === 'skywallet' || project.id === 'astoria'} className="project-scene" assemble settled={settled}>
          <ProjectCover project={project} revealed={revealed} settled={settled} immediate={focused || !interactive || !pointerAllowed}>
          {project.cover ? (
              <motion.div className="project-media project-media--entrance" inherit={false}
                  initial={settled ? false : adaptive ? 'hidden' : reduced || !['skywallet', 'astoria'].includes(project.id) ? false : { opacity: 0, transform: revealTransform(index % 2 ? 'scale' : 'right') }}
                  animate={settled ? { opacity: 1, transform: revealIdentity('soft') } : adaptive ? entered ? 'visible' : 'hidden' : undefined}
                  variants={adaptive ? mobileEntrance(0, motionTokens.mobile.card.scale, motionTokens.mobile.card.opacity) : undefined}
                  whileInView={adaptive || settled ? undefined : { opacity: 1, transform: revealIdentity('soft') }} viewport={{ once: true, amount: .15 }}
                  transition={{ duration: settled ? 0 : reduced ? motionTokens.reduced : motionTokens.artwork, ease: motionTokens.ease }}>
                  <motion.div className="project-media project-media--parallax" inherit={false} style={parallax.style}>
                  <div className="project-artwork project-artwork--image">
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
                  </div>
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
