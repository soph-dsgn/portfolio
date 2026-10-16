import { MediaStageContext } from '../lib/MediaStageContext'
import { useEntrance } from '../lib/useEntrance'
import { useRef, type ReactNode } from 'react'
import { SceneSurface } from './SceneSurface'

/** Shared silhouette with independent presentation for concepts and dense screen groups. */
export function CaseMediaStage({ children, fill = false, multiScreen = false, contained = false, heightFill = false }: {
  children: ReactNode
  fill?: boolean
  multiScreen?: boolean
  contained?: boolean
  heightFill?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useEntrance(ref, .08)
  const variant = fill ? ' case-media-stage--fill'
    : heightFill ? ' case-media-stage--height-fill'
    : multiScreen ? ' case-media-stage--multi-screen'
    : contained ? ' case-media-stage--contained' : ''
  return <MediaStageContext value={visible}><SceneSurface ref={ref} className={`case-media-stage${variant}`}>
    {children}
  </SceneSurface></MediaStageContext>
}
