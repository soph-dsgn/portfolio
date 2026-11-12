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
  srcSet?: string
  avifSrcSet?: string
  webpSrcSet?: string
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
  poster?: string
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
  videos?: CaseVideo[]
}

export const projects: Project[] = [
  {
    id: 'concepts',
    title: 'UI-концепты',
    description: 'Здесь можно немного отойти от продуктовых ограничений. Экспериментирую с визуалом, motion и интерфейсами просто потому, что мне интересно посмотреть: «а что, если сделать вот так?»',
    tags: ['UI', 'Motion'],
    discipline: 'UX/UI-дизайнер',
    platform: 'Web · Mobile',
    document: [],
    cover: '/cases/concept/cover.png?v=90356d747719',
    coverDimensions: { width: 4390, height: 3231 },
    videos: [
      { id: 'uglycash', title: 'UglyCash', shortTitle: 'UglyCash', src: '/cases/concept/1.mp4?v=846c2ee788dc', poster: '/optimized/concepts/poster-1-1600.avif?v=5ec0b152feec', width: 2902, height: 2176 },
      { id: 'sales-analytics', title: 'Панель аналитики продаж', shortTitle: 'Аналитика', src: '/cases/concept/2.mp4?v=5df23a1de127', width: 2902, height: 2176 },
      { id: 'train-tickets', title: 'РЖД', shortTitle: 'РЖД', src: '/cases/concept/3.mp4?v=9ecbd1e26363', poster: '/optimized/concepts/poster-3-1600.avif?v=56004dae01e6', width: 2902, height: 2176 },
      { id: 'visual-collection', title: 'Коллекция изображений', shortTitle: 'Коллекция', src: '/cases/concept/4.mp4?v=63a25aa4e851', poster: '/optimized/concepts/poster-4-1600.avif?v=3fd7acf1a716', width: 2902, height: 2176 },
      { id: 'calendar', title: 'Календарь', shortTitle: 'Календарь', src: '/cases/concept/5.mp4?v=ac25441510f7', poster: '/optimized/concepts/poster-5-1600.avif?v=e5611821ed23', width: 2902, height: 2176 },
      { id: 'energy', title: 'Приложение умного дома', shortTitle: 'Умный дом', src: '/cases/concept/6.mp4?v=6ead4bd87265', poster: '/optimized/concepts/poster-6-1600.avif?v=e4a8c5800030', width: 2902, height: 2176 },
      { id: 'messenger', title: 'Мессенджер', shortTitle: 'Мессенджер', src: '/cases/concept/7.mp4?v=50f9e7305690', poster: '/optimized/concepts/poster-7-1600.avif?v=94e7f32ed4d7', width: 2902, height: 2176 },
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
    document: [],
    cover: '/cases/partner-portal/Cover.png?v=20261109a',
    coverDimensions: { width: 6872, height: 5504 },
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
    document: [],
    cover: '/cases/skywallet/Cover.png?v=27d645c8f479',
    coverDimensions: { width: 4584, height: 3438 },
  },
].map((project) => ({
  ...project,
  cover: project.id === 'concepts' || project.id === 'partner-portal'
    ? publicAsset(project.cover)
    : project.cover ? publicAsset(`/optimized/home/${project.id}-1920.webp`) : undefined,
  coverSrcSet: project.id === 'concepts' ? undefined : project.id === 'partner-portal'
    ? [960, 1920].map(width => `${publicAsset(`/optimized/home/partner-portal-${width}.jpg`)}?v=20261109a ${width}w`).join(', ')
    : project.cover ? [960, 1920].map(width => `${publicAsset(`/optimized/home/${project.id}-${width}.webp`)} ${width}w`).join(', ') : undefined,
  videos: project.videos?.map((video) => ({
    ...video,
    src: publicAsset(video.src),
    poster: video.poster ? publicAsset(video.poster) : undefined,
  })),
}))

