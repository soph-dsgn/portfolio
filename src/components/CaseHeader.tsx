import { motion, useScroll } from 'framer-motion'
import { MobileHeader } from './MobileHeader'

export function CaseHeader() {
  const { scrollYProgress } = useScroll({ trackContentSize: true })
  return <>
    <motion.div className="case-reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    <MobileHeader showBack backTo="/" />
  </>
}
