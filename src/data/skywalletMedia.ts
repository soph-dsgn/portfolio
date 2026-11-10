import type { CaseImage } from './portfolio'
import type { CaseMediaLayout, CaseMediaPlacement } from './caseMedia'
import { publicAsset } from '../lib/publicAsset'

export type SkywalletMediaLayout = CaseMediaLayout
export type SkywalletMediaPlacement = CaseMediaPlacement

type SourceImage = {
  file: string
  caption: string
  width: number
  height: number
}

const skywalletMediaRevision = '20261108b'

function image({ file, caption, width, height }: SourceImage): CaseImage {
  // macOS stores the generated Cyrillic filenames in decomposed Unicode.
  // Keep the request path in that same normalization form so responsive
  // candidates do not 404 while the original PNG still exists.
  const stem = file.replace(/\.[^.]+$/, '').normalize('NFD')
  const srcSet = [960, 1600]
    .map(size => `${encodeURI(publicAsset(`optimized/cases/skywallet/${stem}-${size}.jpg`))}?v=${skywalletMediaRevision} ${Math.min(size, width)}w`)
    .join(', ')
  return {
    src: `${publicAsset(`cases/skywallet/${file}`)}?v=${skywalletMediaRevision}`,
    srcSet,
    alt: caption,
    caption,
    width,
    height,
  }
}

const media = {
  discovery: image({ file: '1.Discovery.png', caption: 'Discovery и проблема двух финансовых контуров', width: 6000, height: 4500 }),
  strategy: image({ file: '2.Продуктовая_стратегия.png', caption: 'Продуктовая стратегия SkyWallet', width: 6000, height: 4500 }),
  onboarding: image({ file: '3.Онбординг_и_безопасность.png', caption: 'Онбординг и безопасность', width: 6000, height: 4500 }),
  context: image({ file: '4.Постоянный_активный_контекст.png', caption: 'Постоянный активный контекст', width: 6000, height: 4500 }),
  send: image({ file: '5.Отправка_средств.png', caption: 'Отправка средств', width: 6320, height: 4500 }),
  errors: [
    image({ file: '6.Предотвращение_ошибок.png', caption: 'Предотвращение ошибок — основной сценарий', width: 3720, height: 4500 }),
    image({ file: '6.1.Предотвращение_ошибок.png', caption: 'Предотвращение ошибок — проверка операции', width: 3720, height: 4500 }),
    image({ file: '6.2.Предотвращение_ошибок.png', caption: 'Предотвращение ошибок — обратная связь', width: 3720, height: 4500 }),
  ],
  receive: image({ file: '7.Получение_средств.png', caption: 'Получение средств', width: 6000, height: 4500 }),
  dex: image({ file: '8.DEX.png', caption: 'DEX и обмен', width: 6000, height: 4500 }),
  cex: image({ file: '9.CEX.png', caption: 'Биржевой контур', width: 6000, height: 4500 }),
  cexDetails: image({ file: '10.Детали_CEX.png', caption: 'Детали CEX', width: 6000, height: 4500 }),
  system: [
    image({ file: '11.Системный_подход.png', caption: 'Системный подход — компоненты', width: 2984, height: 2234 }),
    image({ file: '11.1.Системный_подход.png', caption: 'Системный подход — состояния', width: 2984, height: 2234 }),
    image({ file: '11.2.Системный_подход.png', caption: 'Системный подход — паттерны', width: 2984, height: 2234 }),
    image({ file: '11.3.Системный_подход.png', caption: 'Системный подход — спецификации', width: 2984, height: 2234 }),
  ],
  secondary: image({ file: '12.Настройки.png', caption: 'Настройки и вторичные сценарии', width: 6000, height: 4500 }),
  reflection: image({ file: '13.Финал.png', caption: 'Финал и рефлексия', width: 6000, height: 4500 }),
}

export const skywalletMediaPlacements: SkywalletMediaPlacement[] = [
  { id: 'skywallet-discovery', group: 'context', after: 'Discovery объединил анализ', layout: 'single', images: [media.discovery] },
  { id: 'skywallet-strategy', group: 'structure', after: 'Такой принцип был масштабируемее', layout: 'single', images: [media.strategy] },
  { id: 'skywallet-onboarding', group: 'structure', after: 'поддержка не восстановит локальный пароль', layout: 'single', images: [media.onboarding] },
  { id: 'skywallet-receive', group: 'structure', after: 'Предупреждение о переводе только', layout: 'single', images: [media.receive] },
  { id: 'skywallet-dex', group: 'structure', after: 'Сначала выбирался DEX-', layout: 'single', images: [media.dex] },
  { id: 'skywallet-active-context', group: 'concept', after: 'На ключевых экранах оставались видимыми', layout: 'single', images: [media.context] },
  { id: 'skywallet-send', group: 'concept', after: 'последней проверкой необратимой операции', layout: 'single', images: [media.send] },
  { id: 'skywallet-errors', group: 'concept', after: 'помогало исправить действие', layout: 'row', images: media.errors },
  { id: 'skywallet-cex', group: 'concept', after: 'сначала человек понимал правила текущей зоны', layout: 'single', images: [media.cex] },
  { id: 'skywallet-cex-details', group: 'concept', after: 'сначала человек понимал правила текущей зоны', layout: 'single', images: [media.cexDetails] },
  { id: 'skywallet-secondary', group: 'concept', after: 'актив за сеть', layout: 'single', images: [media.secondary] },
  { id: 'skywallet-system', group: 'system', after: 'Система поддерживала онбординг', layout: 'grid', images: media.system },
  { id: 'skywallet-reflection', group: 'final', after: 'может ли исправить ошибку до подтверждения', layout: 'single', images: [media.reflection] },
]

export function skywalletMediaAfter(projectId: string, group: string, text: string) {
  if (projectId !== 'skywallet') return []
  return skywalletMediaPlacements.filter(placement => placement.group === group && text.includes(placement.after))
}
