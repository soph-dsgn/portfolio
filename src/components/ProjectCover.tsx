import { motionTokens } from '../lib/motion'
import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../data/portfolio'
import { bindShortWords } from '../lib/typography'

/** One measured caption flow and one artwork stage, shared by every cover. */
export function ProjectCover({ project, revealed, immediate, children }: {
  project: Project
  revealed: boolean
  immediate: boolean
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const [reserved, setReserved] = useState(0)
  const [artworkInset, setArtworkInset] = useState(0)
  const [horizontal, setHorizontal] = useState(false)
  useLayoutEffect(() => {
    const root = rootRef.current
    const caption = captionRef.current
    if (!root || !caption) return
    const media = window.matchMedia('(min-width: 1101px) and (prefers-reduced-motion: no-preference)')
    const measure = () => {
      setReserved(caption.offsetHeight + 16)
      setHorizontal(media.matches)
      const dimensions = project.coverDimensions
      setArtworkInset(project.id === 'astoria' && dimensions
        ? Math.max(0, root.clientHeight - Math.min(root.clientHeight, root.clientWidth * dimensions.height / dimensions.width)) : 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    observer.observe(caption)
    media.addEventListener('change', measure)
    return () => { observer.disconnect(); media.removeEventListener('change', measure) }
  }, [project])
  const tags = [...project.tags, ...project.platform.split('·')]
    .flatMap(tag => tag.split('/').map(part => part.trim()))
    .filter(Boolean)
    .map(tag => tag[0].toLocaleUpperCase() + tag.slice(1))

  return <div className="project-cover" ref={rootRef} style={{ '--cover-reserved-height': `${reserved}px` } as CSSProperties}>
    <motion.div className="project-caption" ref={captionRef} initial={false}
      animate={{ opacity: revealed ? 1 : 0, transform: `translateY(${revealed ? 0 : 8}px)` }}
      transition={{ duration: immediate ? 0 : motionTokens.hover, ease: motionTokens.ease }}>
      <div className="project-labels"><div className="project-tags">
        {tags.map(tag => <span className="chip" key={tag}>{tag}</span>)}
      </div></div>
      <h2 id={`${project.id}-title`}>{bindShortWords(project.title)}</h2>
    </motion.div>
    <div className="project-cover-stage">
      <motion.div className="project-cover-visual" initial={false}
        animate={{ transform: `translateY(${revealed && horizontal ? project.id === 'astoria' ? Math.max(32, reserved - artworkInset) : reserved / 2 : 0}px)` }}
        transition={immediate ? { duration: 0 } : motionTokens.interaction}>
        {children}
      </motion.div>
    </div>
  </div>
}
