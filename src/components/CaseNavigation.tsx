import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { projects, type Project } from '../data/portfolio'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { ArrowIcon } from './ArrowIcon'
import '../styles/caseNavigation.css'

const MotionLink = motion.create(Link)

function CaseNavigationItem({ project, previous = false }: { project?: Project; previous?: boolean }) {
  const { reduced, adaptive, hover } = useMotionSystem()
  const label = previous ? 'Предыдущий кейс' : 'Следующий кейс'
  const direction = previous ? 'left' : 'right'
  const className = `case-navigation-item case-navigation-item--${previous ? 'previous' : 'next'}`
  const arrow = <motion.span className="case-navigation-arrow" aria-hidden="true"
    variants={{ rest: { transform: 'translateX(0px)' }, hover: { transform: `translateX(${(previous ? -1 : 1) * motionTokens.caseNavigation.arrowDistance}px)` } }}
    transition={{ duration: reduced ? 0 : motionTokens.hover, ease: motionTokens.ease }}>
    <ArrowIcon direction={direction} decorative />
  </motion.span>
  const content = <>{previous && arrow}<span>{label}</span>{!previous && arrow}</>
  if (!project) return <span className={className} aria-disabled="true">{content}</span>

  return <MotionLink className={className} to={`/projects/${project.id}`} rel={previous ? 'prev' : 'next'} title={project.title}
    initial="rest" animate="rest"
    whileHover={hover && !adaptive && !reduced ? 'hover' : undefined}
    whileTap={reduced ? undefined : 'press'}
    variants={{ rest: { opacity: 1 }, hover: { opacity: motionTokens.caseNavigation.hoverOpacity }, press: { opacity: motionTokens.caseNavigation.pressOpacity } }}
    transition={{ duration: reduced ? 0 : motionTokens.micro, ease: motionTokens.ease }}>
    {content}
  </MotionLink>
}

/** The project data is the single source of order, including UI Concepts. */
export function CaseNavigation({ projectId }: { projectId: string }) {
  const index = projects.findIndex(project => project.id === projectId)
  if (index < 0) return null
  return <nav className="case-navigation" aria-label="Навигация между кейсами">
    <CaseNavigationItem previous project={projects[index - 1]} />
    <CaseNavigationItem project={projects[index + 1]} />
  </nav>
}
