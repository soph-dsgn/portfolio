import { SceneMotionContext } from '../lib/SceneMotionContext'
import { useEntrance } from '../lib/useEntrance'
import { useMotionSystem, useInterfaceReady } from '../lib/motion'
import { useId, useRef, type ReactNode } from 'react'

/** The same rounded segment geometry clips homepage covers and case media. */
export function SceneSurface({ single = false, children, className = '', assemble = false, settled = false }: {
  settled?: boolean
  assemble?: boolean
  single?: boolean
  children: ReactNode
  className?: string
}) {
  const { reduced, adaptive } = useMotionSystem()
  const observe = useRef<HTMLDivElement>(null)
  const visible = useEntrance(observe, adaptive ? .18 : .35)
  const uiReady = useInterfaceReady()
  const assembled = visible && uiReady
  const animated = assemble && !single && !reduced && !settled
  const clipId = `scene-${useId().replace(/:/g, '')}`
  const segments = single ? [[0, 0]] : [[0, 0], [50, 0], [0, 50], [50, 50]]
  return (
    <div ref={animated ? observe : undefined} data-scene-motion={settled ? 'assembled' : animated ? assembled ? 'assembled' : 'waiting' : 'static'} className={`scene-surface ${className}`} style={{ clipPath: `url(#${clipId})` }}>
      <svg className="scene-surface-mask" width="100%" height="100%" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {segments.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={`${x}%`} y={`${y}%`}
                width={single ? '100%' : '50%'} height={single ? '100%' : '50%'}
                style={{ rx: 'var(--radius-scene)', ry: 'var(--radius-scene)' }} />
            ))}
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
      <SceneMotionContext.Provider value={{ reveal: animated && assembled, settled }}>
        {children}
      </SceneMotionContext.Provider>
    </div>
  )
}
