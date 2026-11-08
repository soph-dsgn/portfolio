import type { CaseImage } from './portfolio'

export type CaseMediaLayout = 'single' | 'row' | 'grid' | 'carousel' | 'before-after'

export type CaseMediaPlacement = {
  id: string
  group: 'context' | 'structure' | 'concept' | 'system' | 'final'
  after: string
  layout: CaseMediaLayout
  images: CaseImage[]
}
