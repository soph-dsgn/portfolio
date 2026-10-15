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
    'Разбираюсь в требованиях и сценариях, нахожу места, где легко запутаться, и готовлю решения к разработке. Проверяю не только визуал: понятно ли человеку, что делать, получается ли закончить задачу и есть ли смысл вернуться',
}

export const aboutPresentation = {
  background: 'В Юкки, Make Difference и SkyCapital Group собирала сценарии и дизайн-системы для веб-сервисов и мобильных продуктов и доводила их до разработки. Училась продуктовому и UX/UI-дизайну в FormFactor и Contented',
  statement: 'Люблю разбираться в запутанном и превращать это в понятный продукт.',
  emphasis: 'Обычно начинаю с вопросов, сценариев и ограничений, а заканчиваю интерфейсом, который понятен пользователю, полезен бизнесу и не вызывает вопросов у разработки',
  principles: [
    { title: '+14% к конверсии', description: 'После редизайна лендинга и калькулятора' },
    { title: '−30% времени', description: 'Ключевые задачи в личном кабинете — быстрее' },
    { title: '−35% ошибок', description: 'Меньше ошибок в переработанных формах' },
    { title: '−20% времени запуска', description: 'С готовыми компонентами запускались быстрее' },
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
      { title: 'Редизайн лендинга и интерактивного калькулятора займа', results: ['CR из визита в заявку на займ вырос на +14%', 'Bounce Rate на первом экране снизился на −20%', 'Время работы с калькулятором: −25%'], problem: 'На первом экране люди не до конца понимали стоимость займа и переплату и бросали расчёт ещё при вводе параметров', solution: 'Пересобрала путь от первого экрана до заявки, упростила калькулятор и сделала условия и главные действия заметнее' },
      { title: 'Разработка личного кабинета заемщика', results: ['Рост доли повторных погашений и продлений Retention на +9%', 'Сокращение обращений в службу поддержки по вопросам статуса займа на −25%'], problem: 'Клиентам было трудно найти статус займа, даты платежей и лимиты. Они пропускали платежи или обращались в поддержку', solution: 'Вынесла статус займа и ближайший платёж на дашборд, продумала уведомления. До оплаты или продления осталось 2 клика' },
    ],
  },
  {
    company: 'Make Difference',
    role: 'UX/UI-дизайнер',
    period: '10.2025 — 07.2026',
    logo: '/icons/job/Make_Difference.jpg',
    summary: 'Экосистема женского здоровья, Atlyx и Астория: архитектура и ключевые сценарии',
    projects: [
      { title: '01. Экосистема женского здоровья', results: ['Рост активации новых пользователей (Activation Rate) на +12%', 'Рост CR в запись на консультацию на +10%', 'Рост D30 Retention на +8%', 'Сокращение времени до первого целевого действия на −15%'], problem: 'У врача уже были продукты, контент и консультации, но идея платформы оставалась слишком широкой. Нужно было собрать понятный MVP, а остальное оставить на следующие этапы', solution: 'Определила, что войдёт в MVP, связала модули и разобрала ключевые пути: обучение, консультации, покупки и работу с личными данными' },
      { title: '2. Atlyx — мобильное приложение для путешествий', results: ['Рост D30 Retention на +7%', 'Рост конверсии в создание первой поездки на +12%', 'Рост использования сохраненных мест и маршрутов на +10%'], problem: 'Поездки, перелёты, места и статистику нужно было связать в привычный сценарий. Иначе приложение открывали бы только перед путешествием', solution: 'Выстроила приложение вокруг задач путешественника: планирования, сохранения мест и статистики. Продумала профиль и достижения, чтобы поддержать возвращение в продукт' },
      { title: '3. Астория — онлайн-агрегатор туров', results: ['Рост CR из поиска тура в отправку заявки на +10%', 'Рост CTR карточек туров на +13%', 'Сокращение времени поиска подходящего тура на −16%', 'Снижение отказов на этапе выбора тура на −5%'], problem: 'Бизнес хотел свой поиск и бронирование вместо виджетов Турвизора. Внешний интерфейс не давал управлять выдачей, фильтрами и страницами направлений и мешал развитию', solution: 'Связала поиск, фильтры, выбор и оформление тура. Продумала карточки, страницы направлений и управление контентом, подготовила адаптивные макеты, компоненты и спецификации' },
    ],
  },
  {
    company: 'SkyCapital Group',
    role: 'Product / UX/UI-дизайнер',
    period: '08.2026 — н.в.',
    logo: '/icons/job/SkyCapital_Group.svg',
    summary: 'White Label, Partner Portal и SkyWallet: финансовые сценарии и дизайн-системы',
    projects: [
      { title: '1. Разработка crypto-сайтов «под ключ» по ТЗ (White Label)', results: ['Рост CR в целевую заявку на ~12%', 'Снижение показателей отказов (Bounce Rate) на ~22%', 'Сокращение TTM запуска новых продуктов на ~20%'], problem: 'Партнёрам нужно было быстро запускать лендинги для своих криптопродуктов, сохраняя качество интерфейса и характер бренда', solution: 'Собрала модульную адаптивную сетку, расставила акценты и CTA. Заложила UI-kit для настройки под партнёров и передала разработчикам спецификации' },
      { title: '2. Редизайн внешнего и внутреннего контуров SkyCapital (web + mobile)', results: ['Сокращение времени прохождения ключевых сценариев в личном кабинете на ~30%', 'Снижение процента валидационных ошибок при заполнении форм на ~35%', 'Снижение объема обращений в поддержку по интерфейсным багам в ~1.8 раза'], problem: 'В сложных финансовых данных и операциях пользователи и партнёры теряли контекст. Чтобы разобраться, приходилось писать менеджерам', solution: 'Пересобрала структуру и навигацию кабинета, прояснила статусы и уведомления, убрала лишнюю сложность и продумала мобильные сценарии' },
      { title: '3. Дизайн приложения SkyWallet', results: ['Рост завершенности транзакционных сценариев (CR в успешный перевод) на ~16%', 'Рост показателей удержания пользователей (Retention D7–D30) на ~10%'], problem: 'Людям было трудно разобраться в операциях с цифровыми активами, и они бросали сценарии при входе и переводе средств', solution: 'Сократила путь в ключевых транзакциях, переработала онбординг и собрала интерфейс на общей дизайн-системе' },
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
    description: 'Здесь можно немного отойти от продуктовых ограничений. Экспериментирую с визуалом, motion и интерфейсами просто потому, что мне интересно посмотреть: «а что, если сделать вот так?»',
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
      'Собрала кабинет, где партнёры могут следить за бизнесом, проверять ордера и разбираться с интеграцией',
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
      'Разделила личный кошелёк и биржевой счёт, чтобы в хранении и переводах было меньше путаницы и риска ошибиться',
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
      'Спроектировала сервис, где можно найти, сравнить и оформить тур на любом устройстве. Вместо готовых виджетов использовала API Турвизора — так у бизнеса появился собственный интерфейс и основа онлайн-турагентства',
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
      'Разобралась, как связать обучение, консультации и личный кабинет, и определила, что нужно в первом MVP',
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
      'Собрала поездки, перелёты, сохранённые места и статистику в одном приложении — чтобы планы и история путешествий не терялись между сервисами',
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
