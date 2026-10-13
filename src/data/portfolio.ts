import caseDocuments from './caseDocuments.json'
import { caseCoverDimensions, caseImages } from './caseImages'
import { publicAsset } from '../lib/publicAsset'

export const profile = {
  name: 'Софья Стрельченко',
  role: 'UX/UI & Product Designer',
  location: 'Москва • GMT+3',
  email: 'mailto:sofia.ux.ui@icloud.com',
  telegram: 'https://t.me/wsslxq',
  // No placeholder destinations: enable these actions when real URLs are available.
  cv: undefined as string | undefined,
  hh: undefined as string | undefined,
  linkedin: 'https://www.linkedin.com/in/sophie-dsgn',
  about:
    'Разбираюсь в сложных требованиях, нахожу слабые места в пользовательских сценариях и довожу решения до разработки. Для меня качество дизайна — это и сильный визуал, и результат: сможет ли человек разобраться в продукте, завершить задачу и захотеть вернуться',
}

export const aboutPresentation = {
  background: 'Работала в Юкки, Make Difference и SkyCapital Group над веб-сервисами и мобильными приложениями. Проектирую сценарии, создаю дизайн-системы и довожу решения до разработки. Училась продуктовому и UX/UI-дизайну в FormFactor и Contented',
  statement: 'От идеи — к продукту, который решает задачи.',
  emphasis: 'Соединяю потребности пользователей, цели бизнеса и сильный визуал, чтобы запускать новые сервисы и развивать существующие',
  principles: [
    { title: '+14% к конверсии', description: 'В отправку заявки после редизайна лендинга и калькулятора' },
    { title: '−30% времени', description: 'На прохождение ключевых сценариев в личном кабинете' },
    { title: '−35% ошибок', description: 'При заполнении форм после переработки интерфейсов' },
    { title: '−20% времени запуска', description: 'Новых продуктов благодаря переиспользуемым компонентам' },
  ],
}

export type Experience = {
  company: string
  role: string
  period: string
  summary?: string
  certificateUrl?: string
  logo?: string
  projects?: ExperienceProject[]
}

export type ExperienceProject = {
  title: string
  results: string[]
  problem: string
  solution: string
}

export const experience: Experience[] = [
  {
    company: 'Юкки',
    role: 'UX/UI-дизайнер',
    period: '02.2025 — 10.2025',
    logo: '/icons/job/Юкки.webp',
    summary: 'Редизайн лендинга и калькулятора займа, личный кабинет заёмщика',
    projects: [
      { title: 'Редизайн лендинга и интерактивного калькулятора займа', results: ['Рост CR из визита в отправку анкеты на займ на +14%', 'Снижение показателей отказов (Bounce Rate) на первом экране на −20%', 'Сокращение времени взаимодействия с калькулятором на −25%'], problem: 'Пользователи не до конца понимали итоговую стоимость займа и переплату на первом экране, из-за чего бросали сценарий расчета на этапе ввода базовых параметров', solution: 'Пересобрала пользовательский путь от первого экрана до целевого действия, упростила логику взаимодействия с калькулятором займа, усилила визуальную иерархию и прозрачность условий' },
      { title: 'Разработка личного кабинета заемщика', results: ['Рост доли повторных погашений и продлений Retention на +9%', 'Сокращение обращений в службу поддержки по вопросам статуса займа на −25%'], problem: 'Действующим клиентам было трудно находить информацию о текущем займе, датах платежей и доступных лимитах, из-за чего они совершали просрочки или обращались в саппорт', solution: 'Спроектировала дашборд личного кабинета с акцентом на ключевой статус займа и срочностью погашения, выстроила прозрачную систему нотификаций и сократила путь до совершения платежа или продления до 2 кликов' },
    ],
  },
  {
    company: 'Make Difference',
    role: 'UX/UI-дизайнер',
    period: '10.2025 — 07.2026',
    logo: '/icons/job/Make_Difference.jpg',
    summary: 'Экосистема женского здоровья, Atlyx и Астория: архитектура и ключевые сценарии',
    projects: [
      { title: '01. Экосистема женского здоровья', results: ['Рост активации новых пользователей (Activation Rate) на +12%', 'Рост CR в запись на консультацию на +10%', 'Рост D30 Retention на +8%', 'Сокращение времени до первого целевого действия на −15%'], problem: 'Идея большой платформы вокруг личного бренда врача (обучение, контент, консультации, магазин, личный кабинет, трекинг здоровья) на старте не имела фокуса — нужно было превратить широкую идею в понятный MVP и не распыляться на функции следующих этапов', solution: 'Структурировала продуктовую концепцию и определила MVP-функциональность, разработала архитектуру экосистемы из связанных модулей, определила ключевые сценарии обучения, консультаций, покупок и работы с персональными данными' },
      { title: '2. Atlyx — мобильное приложение для путешествий', results: ['Рост D30 Retention на +7%', 'Рост конверсии в создание первой поездки на +12%', 'Рост использования сохраненных мест и маршрутов на +10%'], problem: 'Приложению требовалось связать хранение поездок, перелетов, мест на карте и статистики в единый привычный сценарий, иначе пользователь открывал бы его пару раз перед поездкой и не возвращался', solution: 'Сформировала структуру приложения вокруг ключевых задач путешественника, спроектировала сценарии планирования поездок, добавления мест и просмотра статистики, разработала концепцию личного кабинета и достижений, заложила игровые механики для повышения вовлеченности' },
      { title: '3. Астория — онлайн-агрегатор туров', results: ['Рост CR из поиска тура в отправку заявки на +10%', 'Рост CTR карточек туров на +13%', 'Сокращение времени поиска подходящего тура на −16%', 'Снижение отказов на этапе выбора тура на −5%'], problem: 'Клиент хотел уйти от внешних виджетов Турвизора к собственному сервису поиска и бронирования: виджеты не давали управлять опытом пользователя (выдачей, фильтрами, страницами направлений), что мешало бизнесу масштабировать продукт', solution: 'Спроектировала UX-архитектуру агрегатора туров, разработала сценарии поиска, фильтрации, выбора и оформления тура, создала структуру карточки тура и страниц направлений, продумала административную часть для управления контентом и промо-блоками, подготовила адаптивные макеты, UI-компоненты и спецификации' },
    ],
  },
  {
    company: 'SkyCapital Group',
    role: 'Product / UX/UI-дизайнер',
    period: '08.2026 — н.в.',
    logo: '/icons/job/SkyCapital_Group.svg',
    summary: 'White Label, Partner Portal и SkyWallet: финансовые сценарии и дизайн-системы',
    projects: [
      { title: '1. Разработка crypto-сайтов «под ключ» по ТЗ (White Label)', results: ['Рост CR в целевую заявку на ~12%', 'Снижение показателей отказов (Bounce Rate) на ~22%', 'Сокращение TTM запуска новых продуктов на ~20%'], problem: 'Заказчикам White Label продуктов требовалось оперативно запускать конверсионные лендинги под индивидуальные криптопродукты без потери в качестве пользовательского опыта и брендинга', solution: 'Спроектировала гибкую модульную сетку и адаптивную архитектуру посадочных страниц, усилила визуальную иерархию и CTA-структуру, заложила масштабируемый UI-kit для быстрой кастомизации под требования партнёров и передала разработчикам чистые спецификации' },
      { title: '2. Редизайн внешнего и внутреннего контуров SkyCapital (web + mobile)', results: ['Сокращение времени прохождения ключевых сценариев в личном кабинете на ~30%', 'Снижение процента валидационных ошибок при заполнении форм на ~35%', 'Снижение объема обращений в поддержку по интерфейсным багам в ~1.8 раза'], problem: 'Пользователи и партнеры теряли контекст при работе со сложными финансовыми данными и транзакциями, из-за чего зависели от ручной коммуникации с менеджерами', solution: 'Пересобрала информационную архитектуру и навигацию внутреннего контура, выстроила прозрачную систему статусов и уведомлений, снизила когнитивную нагрузку в интерфейсах личного кабинета и оптимизировала адаптивные сценарии под мобильные устройства' },
      { title: '3. Дизайн приложения SkyWallet', results: ['Рост завершенности транзакционных сценариев (CR в успешный перевод) на ~16%', 'Рост показателей удержания пользователей (Retention D7–D30) на ~10%'], problem: 'Пользователям было сложно ориентироваться в базовых операциях с цифровыми активами, что приводило к брошенным сценариям на этапе авторизации и перевода средств', solution: 'Упростила сценарий ключевых транзакций до минимального количества шагов, переработала UX-логику онбординга и обеспечила высокую консистентность интерфейсных элементов на базе единой дизайн-системы' },
    ],
  },
].map((item) => ({ ...item, logo: item.logo ? publicAsset(item.logo) : undefined }))

export const education: Experience[] = [
  { company: 'FormFactor', role: 'Продуктовый дизайн', period: '2026', logo: '/icons/job/Изображение ChatGPT 1 окт. 2026 г., 01_11_09.png' },
  {
    company: 'Contented',
    role: 'UX/UI-дизайнер с нуля до PRO',
    period: '2024 — 2025',
    logo: '/icons/job/Contented.png',
    certificateUrl: 'https://cloud.mail.ru/public/8w32/g9yfb6Yg2',
  },
].map((item) => ({ ...item, logo: item.logo ? publicAsset(item.logo) : undefined }))

// Keep the editorial order: design, research, collaboration, then AI.
export const toolLogos = [
  { id: 'figma', label: 'Figma', src: '/icons/tools/figma.svg' },
  { id: 'protopie', label: 'ProtoPie', src: '/icons/tools/protopie.svg' },
  { id: 'principle', label: 'Principle', src: '/icons/tools/principle-app-2.svg' },
  { id: 'miro', label: 'Miro', src: '/icons/tools/miro.svg' },
  { id: 'yandex-metrica', label: 'Яндекс Метрика', src: '/icons/tools/yandex-metrica.svg' },
  { id: 'google-analytics', label: 'Google Analytics', src: '/icons/tools/google-analytics.svg' },
  { id: 'notion', label: 'Notion', src: '/icons/tools/notion.svg' },
  { id: 'jira', label: 'Jira', src: '/icons/tools/jira-3.svg' },
  { id: 'confluence', label: 'Confluence', src: '/icons/tools/Confluence.svg' },
  { id: 'chatgpt', label: 'ChatGPT', src: '/icons/tools/chatgpt.svg' },
  { id: 'claude', label: 'Claude', src: '/icons/tools/claude.svg' },
  { id: 'cursor', label: 'Cursor', src: '/icons/tools/cursor.svg' },
].map((tool) => ({ ...tool, src: publicAsset(tool.src) }))

export const aboutTools = toolLogos.filter(({ id }) => id !== 'cursor').flatMap(({ id, label }) => id === 'figma'
  ? [{ id, label }, { id: 'figma-motion', label: 'Figma Motion' }, { id: 'figjam', label: 'FigJam' }]
  : [{ id, label }])

export type CaseBlock = {
  kind: string
  bullet: boolean
  text: string
}

export type CaseImage = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  screenCount?: number
}

export type CaseVideo = {
  id: string
  title: string
  shortTitle: string
  src: string
  poster: string
  width: number
  height: number
}

export type Project = {
  id: string
  title: string
  description: string
  tags: string[]
  discipline: string
  platform: string
  niche?: string
  document: CaseBlock[]
  figmaUrl?: string
  /** Homepage-only cover. Case study content must use the existing images/videos. */
  cover?: string
  coverDimensions?: { width: number; height: number }
  coverSrcSet?: string
  images?: Partial<Record<'context' | 'structure' | 'concept' | 'system' | 'final', CaseImage[]>>
  videos?: CaseVideo[]
}

export const projects: Project[] = [
  {
    id: 'concepts',
    title: 'Концепты',
    description: 'В свободное время исследую визуальные подходы и анимацию интерфейсов в собственных концептах',
    tags: ['UI', 'Motion'],
    discipline: 'UX/UI-дизайнер',
    platform: 'Web · Mobile',
    document: [],
    cover: '/cases/concept/Обложка.png?v=6bad2b766e49',
    coverDimensions: { width: 4584, height: 3438 },
    videos: [
      { id: 'crypto-wallet', title: 'Криптокошелёк', shortTitle: 'Криптокошелёк', src: '/cases/concept/3.mp4?v=462cab3cd9d6', poster: '/optimized/concepts/poster-3.webp?v=af7125f89aa3', width: 2800, height: 2100 },
      { id: 'train-tickets', title: 'РЖД', shortTitle: 'РЖД', src: '/cases/concept/7.mp4?v=47339e11983b', poster: '/optimized/concepts/poster-7.webp?v=b2c2ae29097c', width: 2800, height: 2100 },
      { id: 'calendar', title: 'Календарь', shortTitle: 'Календарь', src: '/cases/concept/8.mp4?v=805abfba7d0c', poster: '/optimized/concepts/poster-8.webp?v=4211dcc657a6', width: 2800, height: 2100 },
      { id: 'messenger', title: 'Мессенджер', shortTitle: 'Мессенджер', src: '/cases/concept/2.mp4', poster: '/optimized/concepts/poster-2.webp', width: 2800, height: 2100 },
      { id: 'energy', title: 'Приложение умного дома', shortTitle: 'Умный дом', src: '/cases/concept/1.mp4', poster: '/optimized/concepts/poster-1.webp', width: 2800, height: 2100 },
      { id: 'sales-analytics', title: 'Панель аналитики продаж', shortTitle: 'Аналитика', src: '/cases/concept/4.mp4', poster: '/optimized/concepts/poster-4.webp', width: 2800, height: 2100 },
      { id: 'weather', title: 'Приложение погоды', shortTitle: 'Погода', src: '/cases/concept/6.mp4', poster: '/optimized/concepts/poster-6.webp', width: 2800, height: 2100 },
      { id: 'crypto-portfolio', title: 'Криптопортфель', shortTitle: 'Криптопортфель', src: '/cases/concept/5.mp4?v=4f9a91800fc1', poster: '/optimized/concepts/poster-5.webp?v=c6bc07e2437a', width: 2800, height: 2100 },
    ],
  },
  {
    id: 'partner-portal',
    title: 'Partner Portal — проверка ордеров на 25% быстрее',
    description:
      'Собрала в кабинете показатели бизнеса, проверку ордеров и диагностику интеграции',
    tags: ['B2B', 'FinTech / Crypto'],
    discipline: 'Product дизайнер',
    platform: 'Web · Mobile',
    niche: 'FinTech / Crypto',
    document: caseDocuments['partner-portal'],
    cover: '/cases/partner-portal/Обложка.png?v=b4b1f39522d9',
    coverDimensions: caseCoverDimensions('partner-portal'),
    images: caseImages['partner-portal'],
  },
  {
    id: 'skywallet',
    title: 'SkyWallet — ошибки переводов −30%',
    description:
      'Спроектировала безопасные сценарии хранения и перевода активов с понятным разделением личного кошелька и биржевого счёта.',
    tags: ['B2C', 'FinTech / Crypto'],
    discipline: 'Product дизайнер',
    platform: 'Mobile app',
    niche: 'Fintech / Crypto',
    document: caseDocuments.skywallet,
    cover: '/cases/skywallet/Обложка.png?v=1cf91a9bd5c6',
    coverDimensions: caseCoverDimensions('skywallet'),
    images: caseImages.skywallet,
  },
  {
    id: 'astoria',
    title: 'Астория — +12% к заявкам',
    description:
      'Спроектировала адаптивный сервис для поиска, сравнения и оформления туров. Собственный интерфейс на базе API Турвизора позволил выйти за рамки готовых виджетов и заложить основу онлайн-турагентства',
    tags: ['B2C', 'TravelTech'],
    discipline: 'UX/UI-дизайнер',
    platform: 'Web · Mobile',
    niche: 'TravelTech',
    document: caseDocuments.astoria,
    cover: '/cases/astoria/Обложка.png?v=7bdf0731c28e',
    coverDimensions: caseCoverDimensions('astoria'),
    images: caseImages.astoria,
  },
  {
    id: 'womens-health',
    title: 'HealthTech: +25% Activation Rate',
    description:
      'Определила архитектуру и границы MVP для платформы с обучением, консультациями и личным кабинетом.',
    tags: ['B2C', 'FemTech / HealthTech'],
    discipline: 'UX/UI-дизайнер',
    platform: 'mobile app · landing',
    niche: 'FemTech / HealthTech',
    document: caseDocuments['womens-health'],
    cover: '/cases/womens-health/Обложка.png?v=a1b38781be77',
    coverDimensions: caseCoverDimensions('womens-health'),
    images: caseImages['womens-health'],
  },
  {
    id: 'atlyx',
    title: 'Atlyx — travel superapp с retention +10%',
    description:
      'Связала планирование поездок, перелёты, сохранённые места и личную статистику в мобильном приложении',
    tags: ['B2C', 'TravelTech'],
    discipline: 'UX/UI-дизайнер',
    platform: 'Mobile app',
    niche: 'TravelTech',
    document: caseDocuments.atlyx,
    cover: '/cases/atlyx/Обложка.png?v=963cfe6f81c1',
    coverDimensions: caseCoverDimensions('atlyx'),
    images: caseImages.atlyx,
  },
].map((project) => ({
  ...project,
  cover: project.cover ? publicAsset(`/optimized/home/${project.id === 'concepts' ? 'concept' : project.id}-1920.webp`) : undefined,
  coverSrcSet: project.cover ? [960, 1920].map(width => `${publicAsset(`/optimized/home/${project.id === 'concepts' ? 'concept' : project.id}-${width}.webp`)} ${width}w`).join(', ') : undefined,
  videos: project.videos?.map((video) => ({
    ...video,
    src: publicAsset(video.src),
    poster: publicAsset(video.poster),
  })),
}))

export const caseSections = [
  { id: 'context', label: 'Контекст' },
  { id: 'structure', label: 'Стратегия' },
  { id: 'concept', label: 'Решение' },
  { id: 'system', label: 'Система' },
  { id: 'final', label: 'Результат' },
]
