import { useLocation, useNavigationType } from 'react-router-dom'
import { motionTokens, useMotionSystem } from './motion'

/** Continue a card's gesture in existing case hero content; never replay on POP. */
export function usePortalEntry() {
  const { state } = useLocation()
  const navigationType = useNavigationType()
  const { reduced } = useMotionSystem()
  const entering = !reduced && navigationType === 'PUSH' && Boolean(state?.portal)
  return {
    initial: entering ? { opacity: motionTokens.signature.portal.entryOpacity, transform: `scale(${motionTokens.signature.portal.entryScale})` } : false as const,
    animate: { opacity: 1, transform: 'scale(1)' },
    transition: { duration: entering ? motionTokens.signature.portal.entryDuration : 0, ease: motionTokens.ease },
    style: { transformOrigin: 'left top' },
  }
}
