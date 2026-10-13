import { motion, useInView } from 'framer-motion'
import { motionTokens, useMotionSystem, useInterfaceReady } from '../lib/motion'
import { useId, useRef, type ReactNode } from 'react'

/** The same rounded segment geometry clips homepage covers and case media. */
export function SceneSurface({ single = false, children, className = '', assemble = false, opening = false }: {
  assemble?: boolean
  opening?: boolean
  single?: boolean
  children: ReactNode
  className?: string
}) {
  const { reduced, adaptive } = useMotionSystem()
  const observe = useRef<HTMLDivElement>(null)
  const visible = useInView(observe, { once: true, amount: .12 })
  const uiReady = useInterfaceReady()
  const assembled = visible && uiReady
  const animated = assemble && !single && !reduced
  const amplitude = adaptive ? motionTokens.signature.scene.mobileDistance : motionTokens.signature.scene.distance
  const separation = !single && !reduced && opening ? motionTokens.signature.scene.portalDistance : animated && !assembled ? amplitude : 0
  const gap = motionTokens.signature.scene.distance * 2
  const clipId = `scene-${useId().replace(/:/g, '')}`
  const segments = single ? [[0, 0]] : [[0, 0], [50, 0], [0, 50], [50, 50]]
  return (
    <div ref={animated ? observe : undefined} data-scene-motion={animated ? assembled ? 'assembled' : 'waiting' : 'static'} className={`scene-surface ${className}`} style={{ clipPath: `url(#${clipId})` }}>
      <svg className="scene-surface-mask" width="100%" height="100%" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {segments.map(([x, y]) => (
              <motion.rect key={`${x}-${y}`} x={`${x}%`} y={`${y}%`}
                width={single ? '100%' : '50%'} height={single ? '100%' : '50%'}
                initial={false}
                animate={{ transform: `translate(${(x === 0 ? -1 : 1) * separation}px, ${(y === 0 ? -1 : 1) * separation}px)` }}
                transition={{ duration: reduced ? 0 : opening ? motionTokens.signature.portal.duration : adaptive ? motionTokens.signature.scene.mobileDuration : motionTokens.signature.scene.duration, ease: motionTokens.ease }}
                style={{ rx: 'var(--radius-scene)', ry: 'var(--radius-scene)' }} />
            ))}
            {!single && animated && <>
              <rect width={gap}
                style={{ x: `calc(50% - ${gap / 2}px)`, y: 'var(--radius-scene)', height: 'calc(100% - var(--radius-scene) - var(--radius-scene))' }} />
              <rect height={gap}
                style={{ x: 'var(--radius-scene)', y: `calc(50% - ${gap / 2}px)`, width: 'calc(100% - var(--radius-scene) - var(--radius-scene))' }} />
            </>}
            {!single && (
              /* Join the inner corners in the mask, leaving only the outer edge notches. */
              <rect className="scene-surface-center" x="50%" y="50%"
                style={{
                  width: 'calc(var(--radius-scene) + var(--radius-scene))',
                  height: 'calc(var(--radius-scene) + var(--radius-scene))',
                  transform: 'translate(calc(0px - var(--radius-scene)), calc(0px - var(--radius-scene)))',
                }} />
            )}
            {!single && (
              /* Attribute geometry avoids CSS transforms inside adaptive SVG masks. */
              <rect className="scene-surface-center--adaptive" x="25%" y="25%" width="50%" height="50%" />
            )}
          </clipPath>
        </defs>
      </svg>
      {children}
    </div>
  )
}
