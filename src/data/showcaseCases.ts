/* Case cards shared by the home page and the case page headers. */

export type Pill = string | { text: string; note: string }
export type ShowcaseCase = {
  id: string
  title: string
  points: string[]
  pills: Pill[][]
  art: { stem: string; width: number; height: number; wide?: boolean }
}

export const showcaseCases: Record<'skywallet' | 'partner-portal', ShowcaseCase> = {
  skywallet: {
    id: 'skywallet',
    title: 'Спроектировала SkyWallet: разделила личный кошелёк и биржевой счёт, упростила переводы и снизила риск ошибок',
    points: ['Сравнила четыре криптокошелька по зонам риска', 'Разбила перевод на контрольные точки', 'Оставила сеть и баланс на виду во всём сценарии'],
    pills: [[{ text: 'Ошибки при отправке −20–30%', note: 'после редизайна' }], ['Время перевода −15–25%', 'Первая транзакция +10–15%']],
    art: { stem: 'skywallet-art', width: 1280, height: 1311 },
  },
  'partner-portal': {
    id: 'partner-portal',
    title: 'Собрала Partner Portal с дашбордом, поиском по ордерам и диагностикой вебхуков, чтобы ускорить проверку операций',
    points: ['Дашборд за период: обороты, комиссии, статусы', 'Поиск и проверка ордера в web и mobile', 'Диагностика вебхуков без переписки с поддержкой'],
    pills: [['Проверка ордера −20–30%'], ['Обращения в поддержку −15–25%']],
    art: { stem: 'partner-portal-art', width: 1280, height: 821, wide: true },
  },
}

