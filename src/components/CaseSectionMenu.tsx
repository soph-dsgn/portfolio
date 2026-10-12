import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAdaptivePress } from '../lib/useAdaptivePress'
import { bindShortWords } from '../lib/typography'

type Section = { id: string; label: string }

/** A navigation disclosure, with real anchors rather than a simulated select. */
export function CaseSectionMenu({ sections, active, onNavigate }: {
  sections: Section[]; active: string; onNavigate: (id: string) => void
}) {
  const { variants } = useMotionSystem()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const press = useAdaptivePress()
  const current = sections.find(section => section.id === active) ?? sections[0]
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    const resized = () => { if (window.innerWidth > 1100) setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', escape)
    window.addEventListener('resize', resized)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('resize', resized)
    }
  }, [open])
  return <div className="case-section-disclosure" ref={root}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <motion.button {...press} ref={trigger} type="button" className="case-section-trigger"
      aria-label={`Разделы кейса: ${current?.label ?? ''}`} aria-expanded={open} aria-controls="case-section-panel"
      onClick={() => setOpen(value => !value)}
      >
      <span>{current?.label && bindShortWords(current.label)}</span>
      <motion.svg viewBox="0 0 20 20" fill="none" aria-hidden="true"
        animate={{ transform: `rotate(${open ? 180 : 0}deg)` }} transition={{ duration: reduced ? 0 : motionTokens.navState }}>
        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </motion.button>
    <AnimatePresence>
      {open && <motion.nav id="case-section-panel" className="case-section-panel" aria-label="Разделы кейса"
        initial={{ opacity: 0, transform: reduced ? 'none' : 'translateY(-6px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={{ opacity: 0, transform: reduced ? 'none' : 'translateY(-4px)' }}
        transition={{ duration: reduced ? motionTokens.reduced : motionTokens.menu, ease: motionTokens.ease }}>
        {sections.map((section, index) => <motion.a whileTap={reduced ? undefined : { opacity: .85 }} initial="hidden" animate="visible" variants={variants('fade', index * motionTokens.staggerSmall)} key={section.id} href={`#${section.id}`}
          aria-current={active === section.id ? 'location' : undefined}
          onClick={event => {
            if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
            event.preventDefault(); setOpen(false); trigger.current?.focus(); onNavigate(section.id)
          }}>{bindShortWords(section.label)}</motion.a>)}
      </motion.nav>}
    </AnimatePresence>
  </div>
}
