import { SceneImage } from './SceneImage'
import { captureHomeScroll } from '../lib/pageScroll'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Project } from '../data/portfolio'
import { CaseCursor } from './CaseCursor'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
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
  const navigate = useNavigate()
  const [openingKey, setOpeningKey] = useState<string | null>(null)
  const [portalOpenKey, setPortalOpenKey] = useState<string | null>(null)
  const portalControls = useAnimationControls()
  const pending = useRef<string | null>(null)
  const opening = openingKey === location.key
  useEffect(() => { pending.current = null }, [location.key])
  const reduced = useReducedMotion()
  const { adaptive, mobileEntrance } = useMotionSystem()
  useEffect(() => {
    let cancelled = false
    if (!opening || reduced) { portalControls.set({ transform: 'scale(1)' }); return }
    const enter = async () => {
      await portalControls.start({ transform: `scale(${motionTokens.signature.portal.pressScale})`, transition: { duration: motionTokens.signature.portal.pressDuration, ease: motionTokens.ease } })
      if (cancelled) return
      setPortalOpenKey(location.key)
      await portalControls.start({ transform: `scale(${adaptive ? motionTokens.signature.portal.mobileScale : motionTokens.signature.portal.scale})`, transition: { duration: motionTokens.signature.portal.duration, ease: motionTokens.ease } })
      if (cancelled || pending.current !== location.key) return
      pending.current = null
      navigate(`/projects/${project.id}`, { state: { homeEntryKey: location.key, portal: true } })
    }
    void enter()
    return () => { cancelled = true; portalControls.stop() }
  }, [opening, reduced, adaptive, location.key, project.id, navigate, portalControls])
  const cardRef = useRef<HTMLElement>(null)
  const entered = useEntrance(cardRef)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [interactive, setInteractive] = useState(() => window.matchMedia(hoverQuery).matches)
  const parallax = useArtworkParallax(interactive && !reduced)
  useEffect(() => {
    const media = window.matchMedia(hoverQuery)
    const update = () => { setInteractive(media.matches); setHovered(false) }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const revealed = !interactive || hovered || focused
  function settleHover(event: PointerEvent<HTMLAnchorElement>) {
    parallax.reset()
    if (event.pointerType !== 'mouse' || !event.currentTarget.matches(':hover')) setHovered(false)
  }
  return (
    <article ref={cardRef} className="project-card" data-canvas-panel data-project={project.id}>
      <MotionLink
        className="project-link"
        initial={false} animate={portalControls}
        data-portal-phase={opening ? portalOpenKey === location.key ? 'open' : 'press' : 'idle'}
        whileTap={adaptive && !reduced ? { transform: `scale(${motionTokens.mobile.tapScale})` } : undefined}
        draggable={false}
        to={`/projects/${project.id}`}
        state={{ homeEntryKey: location.key }}
        onClick={event => {
          captureHomeScroll(location.key)
          if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.detail === 0 || reduced) return
          event.preventDefault()
          if (pending.current) return
          pending.current = location.key
          parallax.reset()
          setOpeningKey(location.key)
        }}
        aria-labelledby={`${project.id}-title`}
        data-reveal-details={interactive}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }}
        onMouseOver={() => { if (interactive) setHovered(true) }}
        onPointerMove={parallax.onPointerMove}
        onPointerLeave={() => { setHovered(false); parallax.reset() }}
        onMouseLeave={() => { setHovered(false); parallax.reset() }}
        onPointerCancel={settleHover}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <CaseCursor>
          <SceneSurface single={project.id === 'skywallet' || project.id === 'astoria'} className="project-scene" assemble>
          <ProjectCover opening={portalOpenKey === location.key} project={project} revealed={revealed} immediate={focused || !interactive}>
          {project.cover ? (
              <motion.div className="project-media" style={parallax.style}>
                <motion.div className="project-artwork project-artwork--image"
                  initial={adaptive ? 'hidden' : reduced || !['skywallet', 'astoria'].includes(project.id) ? false : { opacity: 0, transform: revealTransform(index % 2 ? 'scale' : 'right') }}
                  animate={adaptive ? entered ? 'visible' : 'hidden' : undefined}
                  variants={adaptive ? mobileEntrance(0, motionTokens.mobile.card.scale, motionTokens.mobile.card.opacity) : undefined}
                  whileInView={adaptive ? undefined : { opacity: 1, transform: revealIdentity('soft') }} viewport={{ once: true, amount: .15 }}
                  transition={{ duration: reduced ? motionTokens.reduced : motionTokens.artwork, ease: motionTokens.ease }}>
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
