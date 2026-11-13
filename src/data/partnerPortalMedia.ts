import type { CaseImage } from './portfolio'
import type { CaseMediaPlacement } from './caseMedia'
import { publicAsset } from '../lib/publicAsset'

type SourceImage = {
  file: string
  caption: string
  width: number
  height: number
}

const partnerPortalMediaRevision = '20261113a'

function image({ file, caption, width, height }: SourceImage): CaseImage {
  const stem = file.replace(/\.[^.]+$/, '').normalize('NFD')
  const srcSet = [960, 1600]
    .map(size => `${publicAsset(`optimized/cases/partner-portal/${stem}-${size}.jpg`)}?v=${partnerPortalMediaRevision} ${size}w`)
    .join(', ')
  const webp = (size: number) => `${publicAsset(`optimized/cases/partner-portal/${stem}-${size}.webp`)}?v=${partnerPortalMediaRevision}`
  return {
    // The full-screen viewer opens the 2400px WebP instead of the multi-megabyte source PNG.
    src: webp(2400),
    srcSet,
    webpSrcSet: [960, 1600, 2400].map(size => `${webp(size)} ${Math.min(size, width)}w`).join(', '),
    alt: caption,
    caption,
    width,
    height,
  }
}

const media = {
  discovery: [
    image({ file: '1.1.Discovery_исходная_ситуация.png', caption: 'Discovery — исходная ситуация, AS IS', width: 6800, height: 4500 }),
    image({ file: '1.Discovery_исходная_ситуация.png', caption: 'Discovery — целевая ситуация, TO BE', width: 6800, height: 4500 }),
  ],
  insights: [
    image({ file: '2.1.Ключевые_инсайты.png', caption: 'Ключевые инсайты — AS IS', width: 6800, height: 4500 }),
    image({ file: '2.Ключевые_инсайты.png', caption: 'Ключевые инсайты — TO BE', width: 6800, height: 4500 }),
  ],
  problem: [
    image({ file: '3.1.Продуктовая_проблема.png', caption: 'Продуктовая проблема — AS IS', width: 6800, height: 4500 }),
    image({ file: '3.Продуктовая_проблема.png', caption: 'Продуктовая проблема — TO BE', width: 6800, height: 4500 }),
  ],
  orderJourney: [
    image({ file: '4.Поиск_и_проверка_ордера.png', caption: 'Поиск и проверка ордера — этап 1', width: 6800, height: 4500 }),
    image({ file: '4.1.Поиск_и_проверка_ордера.png', caption: 'Поиск и проверка ордера — этап 2', width: 6800, height: 4500 }),
    image({ file: '4.2.Поиск_и_проверка_ордера.png', caption: 'Поиск и проверка ордера — этап 3', width: 8152, height: 6992 }),
  ],
  business: image({ file: '5.Контроль_бизнеса.png', caption: 'Контроль бизнеса и ключевые показатели', width: 6800, height: 4500 }),
  orders: [
    image({ file: '6.Поиск_и_проверка_ордера.png', caption: 'Список ордеров', width: 6800, height: 4500 }),
    image({ file: '6.1.Поиск_и_проверка_ордера.png', caption: 'Детали выбранного ордера', width: 6800, height: 4500 }),
  ],
  orderDetails: image({ file: '7.Детали_ордера.png', caption: 'Детали ордера', width: 6800, height: 4500 }),
  diagnostics: [
    image({ file: '8.Диагностика_интеграции.png', caption: 'История вебхуков', width: 6800, height: 4500 }),
    image({ file: '8.1.Диагностика_интеграции.png', caption: 'Детали события вебхука', width: 6800, height: 4500 }),
  ],
  payouts: [
    image({ file: '9.Выплаты.png', caption: 'Список выплат', width: 6800, height: 4500 }),
    image({ file: '9.1.Выплаты.png', caption: 'Действие и подтверждение выплаты', width: 6800, height: 4500 }),
  ],
  api: [
    image({ file: '10.API.png', caption: 'API и документация', width: 6800, height: 4500 }),
    image({ file: '10.1.API.png', caption: 'Подтверждение критичного действия', width: 6800, height: 4500 }),
  ],
  mobile: [
    image({ file: '11.Мобильная_работа.png', caption: 'Мобильная работа — обзор', width: 6800, height: 4500 }),
    image({ file: '11.1.Мобильная_работа.png', caption: 'Мобильная работа — ордера', width: 6800, height: 4500 }),
    image({ file: '11.2.Мобильная_работа.png', caption: 'Мобильная работа — детали', width: 6800, height: 4500 }),
  ],
  system: [
    image({ file: '12.Системный_подход.png', caption: 'Системный подход — компоненты', width: 3384, height: 2234 }),
    image({ file: '12.1.Системный_подход.png', caption: 'Системный подход — состояния', width: 3384, height: 2234 }),
    image({ file: '12.2.Системный_подход.png', caption: 'Системный подход — паттерны', width: 3384, height: 2234 }),
    image({ file: '12.3.Системный_подход.png', caption: 'Системный подход — спецификации', width: 3384, height: 2234 }),
  ],
  darkTheme: image({ file: '13.Dark_theme.png', caption: 'Светлая и тёмная темы Partner Portal', width: 6800, height: 4500 }),
  reflection: image({ file: '14.Рефлексия.png', caption: 'Итоговый визуал Partner Portal', width: 6800, height: 4500 }),
}

export const partnerPortalMediaPlacements: CaseMediaPlacement[] = [
  { id: 'partner-discovery', group: 'context', after: 'Структуру новых разделов и мобильные версии', layout: 'before-after', images: media.discovery },
  { id: 'partner-insights', group: 'context', after: 'Мобильная версия должна сохранять возможность', layout: 'before-after', images: media.insights },
  { id: 'partner-problem', group: 'context', after: 'Задача интерфейса — сократить эту зависимость', layout: 'before-after', images: media.problem },
  { id: 'partner-order-journey', group: 'structure', after: 'Определить следующее действие или подготовить обращение', layout: 'carousel', images: media.orderJourney },
  { id: 'partner-business', group: 'concept', after: 'Ценность дашборда — в отправной точке', layout: 'single', images: [media.business] },
  { id: 'partner-orders', group: 'concept', after: 'Так список поддерживает первичную проверку', layout: 'carousel', images: media.orders },
  { id: 'partner-order-details', group: 'concept', after: 'раскрыть исходные данные в контексте операции', layout: 'single', images: [media.orderDetails] },
  { id: 'partner-diagnostics', group: 'concept', after: 'конкретное событие и технические данные', layout: 'carousel', images: media.diagnostics },
  { id: 'partner-payouts', group: 'concept', after: 'сохранением или отменой', layout: 'carousel', images: media.payouts },
  { id: 'partner-api', group: 'concept', after: 'объяснение последствий для интеграции', layout: 'carousel', images: media.api },
  { id: 'partner-mobile', group: 'concept', after: 'ту же логику сверки, что и на desktop', layout: 'carousel', images: media.mobile },
  { id: 'partner-system', group: 'system', after: 'Масштабируется не только библиотека компонентов', layout: 'grid', images: media.system },
  { id: 'partner-dark-theme', group: 'system', after: 'В продукте есть и тёмная тема', layout: 'single', images: [media.darkTheme] },
  { id: 'partner-reflection', group: 'final', after: 'критерии успешной проверки без подсказок', layout: 'single', images: [media.reflection] },
]

export function partnerPortalMediaAfter(projectId: string, group: string, text: string) {
  if (projectId !== 'partner-portal') return []
  return partnerPortalMediaPlacements.filter(placement => placement.group === group && text.includes(placement.after))
}
