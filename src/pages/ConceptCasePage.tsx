import { motion } from 'framer-motion'
import { useMotionSystem } from '../lib/motion'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Icon } from '../components/Icon'
import type { CaseVideo, Project } from '../data/portfolio'
import { withoutFinalPeriod } from '../data/caseContent'
import { VisualCaption } from '../components/VisualCaption'
import { CaseMediaStage } from '../components/CaseMediaStage'
import { Typography } from '../components/Typography'

type Props = { project: Project }
const emptyVideos: CaseVideo[] = []

export function ConceptCasePage({ project }: Props) {
  const { hoverLift } = useMotionSystem()
  const reducedMotion = useReducedMotion()
  const videos = project.videos ?? emptyVideos
  const elements = useRef<(HTMLVideoElement | null)[]>([])
  const control = useRef<(index: number) => void>(() => {})
  const [playing, setPlaying] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])

  useEffect(() => {
    const nodes = elements.current.slice(0, videos.length)
    const finished = new Set<number>()
    const manuallyPaused = new Set<number>()
    const blocked = new Set<number>()
    let active: number | null = null
    let manual: number | null = null
    let frame = 0

    const visibility = (video: HTMLVideoElement) => {
      const rect = video.getBoundingClientRect()
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
      return {
        ratio: rect.height > 0 ? visible / rect.height : 0,
        required: rect.height > 0 ? Math.min(0.6, window.innerHeight * 0.75 / rect.height) : 0.6,
        distance: Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2),
      }
    }

    const pauseActive = () => {
      if (active === null) return
      nodes[active]?.pause()
      active = null
      setPlaying(null)
    }

    const start = (index: number) => {
      const video = nodes[index]
      if (!video || active === index) return
      pauseActive()
      active = index
      video.muted = true
      video.playsInline = true
      const onPlayError = () => {
        if (active !== index) return
        pauseActive()
        manual = null
        blocked.add(index)
      }
      let attempt: Promise<void>
      try {
        attempt = video.play()
      } catch {
        onPlayError()
        return
      }
      void attempt.then(() => {
        if (active === index && !video.paused) setPlaying(index)
      }).catch(onPlayError)
    }

    const reconcile = () => {
      if (document.hidden) {
        pauseActive()
        return
      }
      const visible = nodes.map((video) => video ? visibility(video) : null)
      visible.forEach((value, index) => {
        if (!value || value.ratio < 0.15) {
          manuallyPaused.delete(index)
          blocked.delete(index)
        }
      })
      if (manual !== null) {
        const current = visible[manual]
        if (!current || current.ratio < current.required) manual = null
      }
      const eligible = nodes.map((_, index) => index).filter((index) =>
        visible[index] && visible[index].ratio >= visible[index].required &&
        !manuallyPaused.has(index) && !blocked.has(index) && !finished.has(index),
      )
      const best = eligible.sort((a, b) =>
        visible[b]!.ratio - visible[a]!.ratio || visible[a]!.distance - visible[b]!.distance,
      )[0]
      const target = manual ?? (reducedMotion ? undefined : best)
      if (target === undefined) pauseActive()
      else start(target)
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { frame = 0; reconcile() })
    }
    const observer = new IntersectionObserver(schedule, {
      threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
    })

    const onEnded = (event: Event) => {
      const index = nodes.indexOf(event.currentTarget as HTMLVideoElement)
      if (index < 0) return
      finished.add(index)
      setCompleted([...finished])
      if (active === index) {
        active = null
        setPlaying(null)
      }
      if (manual === index) manual = null
      reconcile()
    }
    const onCanPlay = (event: Event) => {
      const index = nodes.indexOf(event.currentTarget as HTMLVideoElement)
      if (index >= 0) blocked.delete(index)
      schedule()
    }

    nodes.forEach((video) => {
      video?.addEventListener('ended', onEnded)
      video?.addEventListener('canplay', onCanPlay)
      if (video) observer.observe(video)
    })
    control.current = (index) => {
      const video = nodes[index]
      if (!video) return
      if (active === index) {
        manuallyPaused.add(index)
        manual = null
        pauseActive()
        return
      }
      if (finished.has(index)) {
        video.currentTime = 0
        finished.delete(index)
        setCompleted([...finished])
      }
      manuallyPaused.delete(index)
      blocked.delete(index)
      const visible = visibility(video)
      if (visible.ratio < visible.required) {
        video.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
      manual = index
      start(index)
    }
    document.addEventListener('visibilitychange', reconcile)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', reconcile)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      nodes.forEach((video) => {
        video?.removeEventListener('ended', onEnded)
        video?.removeEventListener('canplay', onCanPlay)
        video?.pause()
      })
      control.current = () => {}
    }
  }, [videos, reducedMotion])

  return (
    <Typography><div className="case-shell concept-case">
      <main className="case-main" id="main-content" tabIndex={-1}>
        <header className="case-header" id="overview">
          <h1 data-reveal="case-intro" data-reveal-order="0">{project.title}</h1>
          <p className="case-deck" data-reveal="case-intro" data-reveal-order="1">{withoutFinalPeriod(project.description)}</p>
        </header>
        <div className="concept-gallery" aria-label="Видео концептов">
          {videos.map((item, index) => {
            const isPlaying = playing === index
            const hasEnded = completed.includes(index)
            const label = hasEnded && !isPlaying ? 'Повторить' : isPlaying ? 'Пауза' : 'Воспроизвести'
            return (
              <figure className="concept-video-item" id={item.id} key={item.id} data-reveal="image">
                <CaseMediaStage fill><video
                  ref={(node) => { elements.current[index] = node }}
                  src={item.src}
                  poster={item.poster}
                  width={item.width}
                  height={item.height}
                  muted
                  playsInline
                  preload="none"
                  aria-label={item.title}
                /></CaseMediaStage>
                <VisualCaption action={<motion.button {...hoverLift} type="button" className="concept-video-action" onClick={() => control.current(index)} aria-label={`${label}: ${item.title}`} title={`${label}: ${item.title}`}>
                    <span className="concept-video-action-visual"><Icon name={hasEnded && !isPlaying ? 'replay' : isPlaying ? 'pause' : 'play'} /></span>
                  </motion.button>}>
                  {withoutFinalPeriod(item.title)}
                </VisualCaption>
              </figure>
            )
          })}
        </div>
      </main>
    </div></Typography>
  )
}
