import { motion, useScroll } from 'framer-motion'
import { ShowcaseTopBar } from './ShowcaseChrome'

export function CaseHeader() {
  const { scrollYProgress } = useScroll({ trackContentSize: true })
  return <>
    <motion.div className="case-reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    <ShowcaseTopBar label="Назад к кейсам" />
  </>
}
