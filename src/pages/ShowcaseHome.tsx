import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { education, experience, profile, projects, type Experience } from '../data/portfolio'
import { useLocale } from '../i18n/locale'
import { trackEvent } from '../lib/analytics'
import { publicAsset } from '../lib/publicAsset'
import { Icon } from '../components/Icon'
import { ShowcaseFooter, ShowcaseSettings } from '../components/ShowcaseChrome'
import { CaseCard } from '../components/ShowcaseCase'
import { showcaseCases } from '../data/showcaseCases'
import { HeroStickers } from '../components/HeroStickers'

const ease = [0.22, 1, 0.36, 1] as const
const asset = (path: string) => publicAsset(path)

/** Scroll reveal shared by every block below the hero (opacity + 26px rise, like the reference). */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, transform: 'translateY(26px)' }}
    whileInView={{ opacity: 1, transform: 'translateY(0px)' }} viewport={{ once: true, amount: 0.06, margin: '0px 0px -8% 0px' }}
    transition={{ duration: 0.75, ease, delay }}>{children}</motion.div>
}

/* ---------- Hero ---------- */

/** Waist-up illustrated avatar with a transparent background (cut out of the source render). */
const portrait = { src: '/optimized/home/avatar-cutout-706.png', srcSet: '/optimized/home/avatar-cutout-360.png 360w, /optimized/home/avatar-cutout-706.png 706w', width: 706, height: 724 }

function Hero() {
  const { t } = useLocale()
  const [bounce, setBounce] = useState(0)
  const tags = ['Moscow based', 'FinTech & B2B', '4px enjoyer']
  return <section className="sc-hero" aria-labelledby="sc-title">
    <div className="sc-stage">
      <HeroStickers />
      <span className="sc-portrait-hit" aria-hidden="true" onClick={() => setBounce(value => value + 1)} />
      <img key={bounce} className={`sc-portrait${bounce ? ' is-bouncing' : ''}`} src={asset(portrait.src)}
        srcSet={portrait.srcSet.split(', ').map(item => { const [path, width] = item.split(' '); return `${asset(path)} ${width}` }).join(', ')}
        sizes="(max-width: 899px) 60vw, 300px" width={portrait.width} height={portrait.height} alt={t('Фото Софьи Стрельченко')} draggable={false} />
      {/* Full name rises, gets struck through, then the short name and the role follow. */}
      <h1 className="sc-title" id="sc-title">
        <span className="sr-only">{t(profile.name)} — UX/UI & Product Designer</span>
        <span className="sc-line" aria-hidden="true" style={{ '--d': '0.15s' } as CSSProperties}><span className="sc-strike">{t(profile.name)}</span></span>
        <span className="sc-line" aria-hidden="true" style={{ '--d': '1.55s' } as CSSProperties}><span>{t('Софа')}</span></span>
        <span className="sc-line" aria-hidden="true" style={{ '--d': '1.65s' } as CSSProperties}><span>UX/UI & Product Designer</span></span>
      </h1>
      <ul className="sc-tags">
        {tags.map((tag, index) => <li className="sc-tag" key={tag} style={{ '--d': `${1.85 + index * 0.06}s` } as CSSProperties}>{tag}</li>)}
        <li className="sc-tag sc-tag--accent" style={{ '--d': '2.03s' } as CSSProperties}>{t('Готова к классным офферам')}</li>
      </ul>
    </div>
  </section>
}

/* ---------- UI concepts: shared data and playback ---------- */

const conceptVideos = projects.find(project => project.id === 'concepts')?.videos ?? []
/** Slider order: web concepts lead, phones follow. */
const conceptOrder = ['sales-analytics', 'train-tickets', 'uglycash', 'energy', 'messenger', 'visual-collection', 'calendar']
const conceptPosters: Record<string, string> = { 'sales-analytics': '/optimized/concepts/poster-2-960.jpg' }

/** Muted looping concept preview: plays only while on screen and while the visitor has not paused it. */
function useConceptVideo(id: string, autoplay: boolean, observer: IntersectionObserverInit) {
  const { t } = useLocale()
  const video = useRef<HTMLVideoElement>(null)
  const item = conceptVideos.find(entry => entry.id === id)
  const [playing, setPlaying] = useState(() => autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(false)
  const { rootMargin, threshold } = observer
  useEffect(() => {
    const element = video.current
    if (!element) return
    const watcher = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin, threshold })
    watcher.observe(element)
    return () => watcher.disconnect()
  }, [rootMargin, threshold])
  useEffect(() => {
    const element = video.current
    if (!element) return
    // AbortError only means a pause() overtook play(); a refused autoplay leaves the play button visible.
    if (playing && visible) element.play().catch((error: DOMException) => { if (error.name === 'NotAllowedError') setPlaying(false) })
    else element.pause()
  }, [playing, visible])
  const index = conceptVideos.findIndex(entry => entry.id === id) + 1
  const title = item ? t(item.title) : ''
  const media = item && <video ref={video} src={asset(`/optimized/concepts/videos/${index}-960.mp4`)}
    poster={conceptPosters[id] ? asset(conceptPosters[id]) : item.poster} muted loop playsInline
    preload="none" width="960" height="720" aria-hidden="true" tabIndex={-1} />
  const control = <button type="button" className="sc-play" aria-pressed={playing} aria-label={t(playing ? 'Пауза' : 'Воспроизвести') + ': ' + title}
    onClick={() => setPlaying(value => !value)}><Icon name={playing ? 'pause' : 'play'} /></button>
  return { item, title, media, control }
}

function ConceptSlide({ id, onOpen }: { id: string; onOpen: () => void }) {
  const { t } = useLocale()
  const { item, title, media, control } = useConceptVideo(id, true, { threshold: 0.6 })
  if (!item) return null
  return <figure className="sc-slide sc-slide--video">
    {media}
    <button type="button" className="sc-slide-open" aria-label={t('Открыть превью') + ': ' + title} aria-haspopup="dialog"
      onClick={event => { if (event.currentTarget.closest<HTMLElement>('.sc-slider-view')?.dataset.dragged !== 'true') onOpen() }} />
    <figcaption>{title}</figcaption>
    {control}
  </figure>
}

/** Card that leans toward the cursor in 3D (±3.5°, 4px drift, 1.008 scale), easing back when the pointer leaves. */
function useTiltCard() {
  const spring = { stiffness: 170, damping: 22, mass: 0.6 }
  const rotateX = useSpring(0, spring), rotateY = useSpring(0, spring)
  const x = useSpring(0, spring), y = useSpring(0, spring), scale = useSpring(1, spring)
  const enabled = useMotionValue(typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled.get()) return
    const box = event.currentTarget.getBoundingClientRect()
    const dx = ((event.clientX - box.left) / Math.max(box.width, 1) - 0.5) * 2
    const dy = ((event.clientY - box.top) / Math.max(box.height, 1) - 0.5) * 2
    rotateX.set(-3.5 * dy); rotateY.set(3.5 * dx); x.set(4 * dx); y.set(4 * dy); scale.set(1.008)
  }
  const leave = () => { rotateX.set(0); rotateY.set(0); x.set(0); y.set(0); scale.set(1) }
  return { style: { rotateX, rotateY, x, y, scale, transformPerspective: 1100 }, move, leave }
}

/** Concept preview: no panel, just the floating card over a frosted page. Native dialog keeps focus, Esc and focus return. */
function ConceptPreview({ index, direction, onClose, onStep }: {
  index: number; direction: 1 | -1; onClose: () => void; onStep: (direction: 1 | -1) => void
}) {
  const { t } = useLocale()
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const tilt = useTiltCard()
  const item = conceptVideos.find(entry => entry.id === conceptOrder[index])
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
  }, [])
  useEffect(() => {
    const element = video.current
    if (!element) return
    if (playing) element.play().catch((error: DOMException) => { if (error.name === 'NotAllowedError') setPlaying(false) })
    else element.pause()
  }, [playing, index])
  if (!item) return null
  const title = t(item.title)
  return <dialog ref={dialog} className="sc-preview" aria-labelledby="sc-preview-title"
    onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('sc-preview-stage')) dialog.current?.close() }}
    onKeyDown={event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); onStep(1) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); onStep(-1) }
    }}>
    <div className="sc-preview-stage">
      <AnimatePresence mode="popLayout" initial={true} custom={direction}>
        <motion.div key={item.id} className="sc-preview-card" custom={direction}
          initial={{ opacity: 0, x: direction * 60, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction * -60, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="sc-preview-tilt" style={tilt.style} onPointerMove={tilt.move} onPointerLeave={tilt.leave}
            onPointerDown={event => { if (event.pointerType === 'touch') swipe.current = { x: event.clientX, y: event.clientY } }}
            onPointerUp={event => {
              const start = swipe.current; swipe.current = null
              if (!start) return
              const dx = event.clientX - start.x, dy = event.clientY - start.y
              if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) onStep(dx < 0 ? 1 : -1)
            }}>
            <video ref={video} src={item.src} poster={conceptPosters[item.id] ? asset(conceptPosters[item.id]) : item.poster}
              muted loop playsInline preload="auto" width={item.width} height={item.height} aria-label={title} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
    <button type="button" className="sc-preview-button sc-preview-button--close" aria-label={t('Закрыть')} onClick={() => dialog.current?.close()}><Icon name="close" /></button>
    <button type="button" className="sc-preview-button sc-preview-button--prev" aria-label={t('Предыдущий концепт')} onClick={() => onStep(-1)}><Icon name="arrow-left" /></button>
    <button type="button" className="sc-preview-button sc-preview-button--next" aria-label={t('Следующий концепт')} onClick={() => onStep(1)}><Icon name="arrow-left" className="sc-flip" /></button>
    <div className="sc-preview-bar">
      <h2 id="sc-preview-title">{title}</h2>
      <span className="sc-preview-count" aria-hidden="true">{index + 1} / {conceptOrder.length}</span>
      <button type="button" className="sc-preview-toggle" aria-pressed={playing} aria-label={t(playing ? 'Пауза' : 'Воспроизвести') + ': ' + title}
        onClick={() => setPlaying(value => !value)}><Icon name={playing ? 'pause' : 'play'} /></button>
    </div>
  </dialog>
}

/* ---------- Drag slider (UI concepts) ---------- */


/** Pointer drag with inertia, rubber-band edges and wheel/trackpad scrolling — the reference slider's physics. */
function useDragTrack() {
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = view.current, rail = track.current
    if (!viewport || !rail) return
    const rubber = 0.55, maxVelocity = 28, friction = 0.93
    let x = 0, low = 0, velocity = 0, dragging = false, startX = 0, startOffset = 0, lastX = 0, lastTime = 0, frame = 0
    const apply = () => { rail.style.transform = `translate3d(${x}px,0,0)` }
    const clamp = (value: number) => Math.min(0, Math.max(low, value))
    const layout = () => { low = Math.min(0, viewport.clientWidth - rail.offsetWidth - rail.offsetLeft * 2); x = clamp(x); apply() }
    const stop = () => { cancelAnimationFrame(frame); frame = 0; velocity = 0 }
    const glide = () => {
      if (Math.abs(velocity) < 0.2) return
      const next = x + velocity
      if (next > 0 || next < low) { x = clamp(next); apply(); return }
      x = next; velocity *= friction; apply(); frame = requestAnimationFrame(glide)
    }
    const springTo = (target: number) => {
      stop()
      const from = x, distance = target - x, started = performance.now()
      const step = () => {
        const progress = Math.min(1, (performance.now() - started) / 520)
        x = from + distance * (1 - (1 - progress) ** 3); apply()
        if (progress < 1) frame = requestAnimationFrame(step)
      }
      step()
    }
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      stop(); dragging = true; startX = lastX = event.clientX; startOffset = x; lastTime = performance.now()
      viewport.dataset.dragged = 'false'
    }
    const move = (event: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      velocity = (event.clientX - lastX) / Math.max(1, now - lastTime) * 16
      lastX = event.clientX; lastTime = now
      if (Math.abs(event.clientX - startX) > 4 && !viewport.classList.contains('is-dragging')) {
        viewport.classList.add('is-dragging')
        viewport.dataset.dragged = 'true'
        try { viewport.setPointerCapture(event.pointerId) } catch { /* pointer already released */ }
      }
      const raw = startOffset + event.clientX - startX
      x = raw > 0 ? raw * rubber : raw < low ? low + (raw - low) * rubber : raw
      apply()
    }
    const release = () => {
      if (!dragging) return
      dragging = false
      viewport.classList.remove('is-dragging')
      if (performance.now() - lastTime > 90) velocity = 0
      velocity = Math.max(-maxVelocity, Math.min(maxVelocity, velocity))
      if (x > 0) springTo(0)
      else if (x < low) springTo(low)
      else if (Math.abs(velocity) > 0.6) frame = requestAnimationFrame(glide)
    }
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault(); stop(); x = clamp(x - event.deltaX); apply()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault(); springTo(clamp(x + (event.key === 'ArrowLeft' ? 360 : -360)))
    }
    const observer = new ResizeObserver(layout)
    observer.observe(viewport); observer.observe(rail)
    viewport.addEventListener('pointerdown', down)
    viewport.addEventListener('pointermove', move)
    viewport.addEventListener('pointerup', release)
    viewport.addEventListener('pointercancel', release)
    viewport.addEventListener('wheel', wheel, { passive: false })
    viewport.addEventListener('keydown', key)
    layout()
    return () => {
      stop(); observer.disconnect()
      viewport.removeEventListener('pointerdown', down)
      viewport.removeEventListener('pointermove', move)
      viewport.removeEventListener('pointerup', release)
      viewport.removeEventListener('pointercancel', release)
      viewport.removeEventListener('wheel', wheel)
      viewport.removeEventListener('keydown', key)
    }
  }, [])
  return { view, track }
}

function ConceptSlider() {
  const { t } = useLocale()
  const { view, track } = useDragTrack()
  const [open, setOpen] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const count = conceptOrder.length
  return <section className="sc-slider" aria-label={t('UI-концепты')}>
    <div className="sc-slider-view" ref={view} tabIndex={0} aria-label={t('UI-концепты. Листайте стрелками')}>
      <div className="sc-slider-track" ref={track}>
        {conceptOrder.map((id, index) => <ConceptSlide key={id} id={id} onOpen={() => {
          setDirection(1); setOpen(index); trackEvent('project_open', { project: 'concepts', location: 'home-slider' })
        }} />)}
      </div>
    </div>
    {open !== null && <ConceptPreview index={open} direction={direction} onClose={() => setOpen(null)}
      onStep={step => { setDirection(step); setOpen(value => value === null ? value : (value + step + count) % count) }} />}
  </section>
}

/* ---------- Experience (reference "reviews" masonry) ---------- */

function ExperienceCard({ item, children, study = false }: { item: Experience; children?: ReactNode; study?: boolean }) {
  const { t } = useLocale()
  return <article className={`sc-card${study ? ' sc-card--study' : ''}`}>
    {study && <p className="sc-card-badge">{t('Обучение')}</p>}
    <header className="sc-card-head">
      {item.logo ? <img src={item.logo} alt="" width="60" height="60" loading="lazy" decoding="async" /> : <span className="sc-card-logo" aria-hidden="true" />}
      <div><h3>{t(item.company)}</h3><p>{t(item.role)} · {t(item.period)}</p></div>
    </header>
    {children && <div className="sc-card-text">{children}</div>}
  </article>
}

function ExperienceGrid() {
  const { t } = useLocale()
  const [yukki, makeDifference, sky] = experience
  const [formFactor, contented] = education
  // Every job card reads the same: what the work was about, then one headline result per project.
  // `perProject` sets how many real results each card lists, so the three columns fill evenly.
  const job = (item: Experience, perProject: number[]) => <ExperienceCard item={item}>
    {item.summary && <p>{t(item.summary)}</p>}
    {item.projects && <ul>{item.projects.flatMap(project => project.results.slice(0, perProject[item.projects!.indexOf(project)] ?? 1)).map(result => <li key={result}>{t(result)}</li>)}</ul>}
  </ExperienceCard>
  return <section className="sc-experience" aria-labelledby="sc-experience">
    <h2 className="sc-section-title" id="sc-experience">{t('Мой рабочий лор')}</h2>
    <div className="sc-columns">
      <div className="sc-column">{job(yukki, [2, 1])}<ExperienceCard item={contented} study /></div>
      <div className="sc-column">{job(makeDifference, [2, 2, 2])}</div>
      <div className="sc-column">{job(sky, [1, 1, 1])}<ExperienceCard item={formFactor} study /></div>
    </div>
  </section>
}

export function ShowcaseHome() {
  const { t } = useLocale()
  useLayoutEffect(() => { document.title = `${t(profile.name)} — ${profile.role}` }, [t])
  return <>
    <main className="sc" id="main-content" tabIndex={-1}>
      <ShowcaseSettings />
      <Hero />
      <div className="sc-canvas">
        <Reveal><ConceptSlider /></Reveal>
        <Reveal className="sc-gap"><CaseCard item={showcaseCases.skywallet} /></Reveal>
        <Reveal className="sc-gap"><CaseCard item={showcaseCases['partner-portal']} /></Reveal>
        <Reveal className="sc-gap sc-gap--wide"><ExperienceGrid /></Reveal>
      </div>
      <ShowcaseFooter id="contacts" />
    </main>
  </>
}
