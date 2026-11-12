import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useLocale } from '../i18n/locale'

type RailSection = { id: string; title: string }
type Room = 'full' | 'bars' | 'none'

/** Room for the rail in the left gutter: labels need their own width plus a gap, bars alone ~32px. */
const roomFor = (gutter: number, labels: number): Room => gutter >= labels ? 'full' : gutter >= 36 ? 'bars' : 'none'

/**
 * Fixed segmented rail of case sections. Each segment is as tall as its section and fills while it is read.
 * Labels hide while the page scrolls and fade back once it stops; with little room only the bars stay.
 */
export function CaseSectionRail({ sections }: { sections: RailSection[] }) {
  const { t } = useLocale()
  const nav = useRef<HTMLElement>(null)
  const [state, setState] = useState(() => ({ active: '', visible: false, room: 'none' as Room }))

  useEffect(() => {
    const element = nav.current
    if (!element) return
    let frame = 0, idle = 0
    const measure = () => {
      frame = 0
      const nodes = sections.map(section => document.getElementById(section.id))
      if (nodes.some(node => !node)) return
      const anchor = window.innerHeight * 0.4
      const boxes = nodes.map(node => node!.getBoundingClientRect())
      let active = ''
      boxes.forEach((box, index) => {
        const fill = Math.min(1, Math.max(0, (anchor - box.top) / box.height))
        // Written straight to the DOM on every frame of scroll; React never sets these styles.
        const link = element.children[index] as HTMLElement | undefined
        link?.style.setProperty('flex-grow', String(Math.round(box.height)))
        link?.style.setProperty('--fill', fill.toFixed(4))
        if (box.top <= anchor && box.bottom > anchor) active = sections[index].id
      })
      const visible = boxes[0].top < window.innerHeight * 0.75 && boxes[boxes.length - 1].bottom > window.innerHeight * 0.25
      // Labels show only when their widest line clears the text column with a 24px gap.
      const labels = [...element.querySelectorAll<HTMLElement>('.scc-rail-label')]
      const widest = Math.max(0, ...labels.map(label => { const range = document.createRange(); range.selectNodeContents(label); return Math.max(0, ...[...range.getClientRects()].map(rect => rect.width)) }))
      const room = roomFor(boxes[0].left, 16 + 3 + 10 + widest + 24)
      setState(current => current.active === active && current.visible === visible && current.room === room ? current : { active, visible, room })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const scroll = () => {
      element.dataset.scrolling = ''
      window.clearTimeout(idle)
      idle = window.setTimeout(() => { delete element.dataset.scrolling }, 600)
      schedule()
    }
    const observer = new ResizeObserver(schedule)
    sections.forEach(section => { const node = document.getElementById(section.id); if (node) observer.observe(node) })
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', schedule)
    measure()
    return () => {
      cancelAnimationFrame(frame); window.clearTimeout(idle); observer.disconnect()
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', schedule)
    }
  }, [sections])

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(history.state, '', `#${id}`)
  }

  return <nav ref={nav} className="scc-rail" aria-label={t('Разделы кейса')} data-room={state.room} data-visible={state.visible}>
    {sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={state.active === section.id ? 'location' : undefined}
      onClick={event => go(event, section.id)}>
      <span className="scc-rail-bar" aria-hidden="true" />
      <span className="scc-rail-label">{t(section.title)}</span>
    </a>)}
  </nav>
}
