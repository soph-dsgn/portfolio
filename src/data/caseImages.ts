import sizes from './caseImageSizes.json'
import type { CaseImage, Project } from './portfolio'
import { publicAsset } from '../lib/publicAsset'

type Section = keyof NonNullable<Project['images']>
type CaseImages = NonNullable<Project['images']>
type ImageEntry = [file: string, caption: string]

// Counts describe the existing compositions, not their aspect ratio.
// Only groups with at least three screens opt into the compact presentation.
const multiScreenCounts: Partial<Record<keyof typeof sizes, Record<string, number>>> = {
  'partner-portal': { 'Mob - 12.png': 3, 'Mob - 13.png': 3 },
  skywallet: {
    '1.png': 4, '3.png': 4, '4.png': 3, '5.png': 4, '6.png': 4, '7.png': 3,
    'CEX - 9.png': 4, 'CEX - 10.png': 3, 'CEX - 11.png': 3, 'CEX - 12.png': 5,
    '13.png': 4, '14.png': 4, '15.png': 3, '16.png': 4,
  },
  astoria: { '8.png': 4 },
  'womens-health': {
    '1.png': 3, '2.png': 4, '3.png': 3, '4.png': 4, '5.png': 3, '6.png': 3,
    '7.png': 3, '8.png': 4, '9.png': 5, '10.png': 4, '11.png': 3, '12.png': 3,
    '13.png': 3,
  },
  atlyx: {
    '1.png': 4, '2.png': 3, '3.png': 3, '4.png': 3, '6.png': 5, '7.png': 3,
    '8.png': 4, '11.png': 5, '12.png': 3, '13.png': 3, '14.png': 3, '15.png': 3,
  },
}

export function caseCoverDimensions(caseId: keyof typeof sizes) {
  const [width, height] = (sizes[caseId] as Record<string, number[]>)['Обложка.png']
  return { width, height }
}

function image(caseId: keyof typeof sizes, file: string, caption: string): CaseImage {
  const [width, height] = (sizes[caseId] as Record<string, number[]>)[file]
  const stem = file.replace(/\.[^.]+$/, '')
  const optimized = (format: 'avif' | 'webp') => [960, 1600]
    .map(size => `${encodeURI(publicAsset(`optimized/cases/${caseId}/${stem}-${size}.${format}`))} ${Math.min(size, width)}w`)
    .join(', ')
  return {
    src: publicAsset(`cases/${caseId}/${file}`),
    avifSrcSet: optimized('avif'),
    webpSrcSet: optimized('webp'),
    alt: caption,
    caption,
    width,
    height,
    screenCount: multiScreenCounts[caseId]?.[file],
  }
}

function gallery(caseId: keyof typeof sizes, groups: Partial<Record<Section, ImageEntry[]>>): CaseImages {
  return Object.fromEntries(
    Object.entries(groups).map(([section, entries]) => [
      section,
      entries.map(([file, caption]) => image(caseId, file, caption)),
    ]),
  ) as CaseImages
}

export const caseImages = {
  'partner-portal': gallery('partner-portal', {
    context: [
      ['As Is - 1.png', 'Исходный интерфейс: вход, список ордеров и карточка заказа'],
      ['As Is - 1.1.png', 'Исходный список ордеров'],
      ['As Is - 1.2.png', 'Исходная карточка заказа'],
    ],
    structure: [
      ['2.png', 'Сценарии входа и подтверждения доступа'],
      ['2.1.png', 'Подтверждение доступа'],
      ['3.png', 'Состояния авторизации и восстановления доступа'],
      ['3.1.png', 'Ошибка при входе'],
    ],
    concept: [
      ['4.png', 'Дашборд партнёра с ключевыми показателями'],
      ['5.png', 'Список ордеров и детали заказа'],
      ['5.1.png', 'Сценарий работы с ордером'],
      ['5.2.png', 'Пустое состояние поиска ордера'],
      ['6.png', 'Управление клиентами'],
      ['6.1.png', 'Перевод комиссии клиента'],
      ['6.2.png', 'Состояние перевода комиссии'],
      ['7.png', 'Работа с выплатами'],
      ['7.1.png', 'Статусы и подтверждения операций'],
      ['8.png', 'Список событий вебхуков'],
      ['8.1.png', 'Детали события вебхука'],
      ['9.png', 'Настройка API-интеграции'],
      ['9.1.png', 'Подтверждение API-ключа'],
      ['10.png', 'Команда и доступы'],
      ['10.1.png', 'Добавление сотрудника'],
      ['10.2.png', 'Подтверждение добавления сотрудника'],
    ],
    system: [
      ['11.png', 'Тёмная тема входа'],
      ['11.1.png', 'Тёмная тема входа и дашборда'],
    ],
    final: [
      ['Mob - 12.png', 'Мобильный вход, навигация и дашборд'],
      ['Mob - 13.png', 'Мобильная работа с ордерами'],
      ['Mob - 14.png', 'Мобильные клиенты и выплаты'],
    ],
  }),
  skywallet: gallery('skywallet', {
    context: [
      ['1.png', 'Вход, безопасность и выбор способа восстановления'],
      ['2.png', 'Предупреждения о рисках хранения активов'],
    ],
    structure: [
      ['3.png', 'Активы и история операций в личном кошельке'],
      ['4.png', 'Добавление аккаунта и выбор способа доступа'],
    ],
    concept: [
      ['5.png', 'Выбор актива и адреса для перевода'],
      ['6.png', 'Подтверждение отправки средств'],
      ['7.png', 'Расчёт обмена и подтверждение операции'],
      ['8.png', 'Получение средств и QR-код'],
      ['CEX - 9.png', 'Доступ к биржевому счёту'],
      ['CEX - 10.png', 'Активы и операции биржевого счёта'],
      ['CEX - 11.png', 'Детали операций биржевого счёта'],
      ['CEX - 12.png', 'Перевод между кошельком и биржевым счётом'],
    ],
    system: [
      ['13.png', 'Выбор сети, безопасность и подтверждения'],
      ['14.png', 'Настройки, поддержка и справка'],
      ['15.png', 'Смена языка и валюты'],
    ],
    final: [['16.png', 'Развитие интерфейса: от схемы к итоговым экранам']],
  }),
  astoria: gallery('astoria', {
    context: [['1.png', 'Главная страница и точки входа в поиск туров']],
    structure: [['2.png', 'Поисковая выдача, фильтры и сравнение вариантов']],
    concept: [
      ['3.png', 'Каталог направлений'],
      ['4.png', 'Страницы направлений и подборки туров'],
      ['5.png', 'Карточка тура и подробная информация'],
      ['6.png', 'Сценарий оформления заявки'],
    ],
    system: [['7.png', 'Информационная страница сервиса']],
    final: [['8.png', 'Адаптация поиска и бронирования для мобильного экрана']],
  }),
  'womens-health': gallery('womens-health', {
    context: [['1.png', 'Первое знакомство с продуктом']],
    structure: [
      ['2.png', 'Регистрация и создание аккаунта'],
      ['3.png', 'Вход в личный кабинет'],
      ['4.png', 'Восстановление доступа'],
    ],
    concept: [
      ['5.png', 'Авторизация и состояния входа'],
      ['6.png', 'Профиль и персональные настройки'],
      ['7.png', 'Покупки, платежи и информация о подписке'],
      ['8.png', 'Главный экран, уведомления и запись на консультацию'],
      ['9.png', 'Инструменты и персональный трекинг здоровья'],
      ['10.png', 'Каталог курсов и учебный материал'],
      ['11.png', 'Состояния доступа к контенту'],
      ['12.png', 'Общение и поддержка внутри приложения'],
    ],
    system: [['13.png', 'Связь мобильного продукта с веб-платформой']],
    final: [['14.png', 'Веб-версия платформы и личный кабинет']],
  }),
  atlyx: gallery('atlyx', {
    context: [['1.png', 'Регистрация и настройка профиля путешественника']],
    structure: [
      ['2.png', 'Вход и восстановление доступа'],
      ['3.png', 'Первое знакомство с возможностями приложения'],
      ['4.png', 'Онбординг: карта, перелёты и переводчик'],
    ],
    concept: [
      ['5.png', 'Карта поездок и добавление маршрута'],
      ['6.png', 'Поиск мест и фильтрация карты'],
      ['7.png', 'Карточка и детали перелёта'],
      ['8.png', 'Добавление рейса'],
      ['9.png', 'Ручной ввод данных рейса'],
      ['10.png', 'Список перелётов'],
      ['11.png', 'Мои места и сохранённые точки'],
    ],
    system: [
      ['12.png', 'Статистика путешествий, уведомления и переводчик'],
      ['13.png', 'Настройки профиля и безопасности'],
      ['14.png', 'Управление аккаунтом, языком и подпиской'],
    ],
    final: [['15.png', 'Итоговый сценарий на карте мира']],
  }),
} satisfies Record<keyof typeof sizes, CaseImages>
