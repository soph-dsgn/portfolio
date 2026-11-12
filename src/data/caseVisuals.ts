import type { CaseVisualSpec } from './caseVisualTypes'

export const caseVisuals: Record<string, CaseVisualSpec[]> = {
  'partner-portal': [
    {
      id: 'portal-map', group: 'context', after: 'Задача Partner Portal', title: 'Карта рабочего кабинета', kind: 'levels',
      items: [
        { label: 'Контроль', detail: 'Дашборд: показатели, динамика и статусы за период', note: 'Сводка за выбранный период' },
        { label: 'Операции', detail: 'Ордера, поиск и детали обмена', note: 'Переработаны существующие разделы' },
        { label: 'Самообслуживание', detail: 'Вебхуки, комиссии, документация, клиенты и команда', note: 'Новые сценарии и переработка существующих' },
      ],
    },
    {
      id: 'portal-insights', group: 'context', after: 'Мобильная версия должна сохранять', title: 'От задачи к решению', kind: 'columns',
      presentation: 'problem-solution',
      pairTones: { problem: 'problem', response: 'solution' },
      columns: ['Задача', 'Проблема', 'Решение'],
      items: [
        { label: 'Оценить работу за период', detail: 'Список ордеров не даёт общей сводки', note: 'Дашборд с показателями, динамикой и статусами' },
        { label: 'Проверить ордер', detail: 'Данные для сверки разнесены по экрану', note: 'Последовательная иерархия деталей' },
        { label: 'Проверить интеграцию', detail: 'Статус операции не объясняет доставку уведомления', note: 'Отдельная история вебхуков и детали доставки' },
      ], caption: 'Основание: разбор существующего интерфейса и технического задания',
    },
    {
      id: 'portal-support', group: 'context', after: 'Так обслуживание партнёров зависело', title: 'Почему партнёр обращается в поддержку', kind: 'comparison',
      presentation: 'risks',
      items: [
        { label: 'Проверка статуса', detail: 'Не хватает общей картины и последовательной сверки данных ордера', note: 'Партнёр уточняет состояние операции вручную', tone: 'problem' },
        { label: 'Проверка интеграции', detail: 'Статус обмена не отвечает на вопрос о доставке уведомления', note: 'Партнёр запрашивает технические данные у поддержки', tone: 'problem' },
      ], caption: 'Оба пути увеличивают нагрузку на поддержку, если данные и следующий шаг недоступны в кабинете',
    },
    {
      id: 'portal-hierarchy', group: 'structure', after: 'Поэтому связала рабочие разделы', title: 'Уровни информации', kind: 'comparison',
      presentation: 'comparison',
      items: [
        { label: 'Дашборд', detail: 'Период → ключевые показатели → динамика и распределение статусов', tone: 'neutral' },
        { label: 'Детали ордера', detail: 'Статус и суммы → комиссии и клиент → технический запрос', tone: 'neutral' },
      ], caption: 'От общего состояния бизнеса к данным, нужным для конкретной проверки',
    },
    {
      id: 'portal-flow', group: 'structure', after: 'Структура кабинета объединяет', title: 'Основной путь проверки', kind: 'flow', numbered: true,
      items: [
        { label: 'Дашборд', detail: 'Оценить период и заметить отклонение' },
        { label: 'Поиск ордера', detail: 'Найти операцию через список и фильтры' },
        { label: 'Детали', detail: 'Сверить статус, суммы, комиссии и данные клиента' },
        { label: 'Данных достаточно?', branches: { yes: 'Определить следующий шаг', no: 'Перейти к диагностике' } },
        { label: 'Диагностика', detail: 'Проверить вебхук, запрос и ответ; затем повторить проверку или передать данные в поддержку' },
      ],
    },
    {
      id: 'portal-commission', group: 'structure', after: 'Сохранение или отмена изменения', title: 'Изменение комиссии', kind: 'flow', numbered: true,
      items: [
        { label: 'Текущее значение', detail: 'Просмотр настройки' },
        { label: 'Диалог', detail: 'Явное начало редактирования' },
        { label: 'Новое значение', detail: 'Ввод с проверкой допустимого формата' },
        { label: 'Исход', detail: 'Сохранить изменение или отменить' },
      ], caption: 'Диапазон и формат комиссии требуют согласования с продуктовой логикой и API',
    },
    {
      id: 'portal-orders-before-after', group: 'concept', after: 'Компактные фильтры', title: 'Работа с ордерами: до и после', kind: 'comparison',
      presentation: 'before-after',
      items: [
        { label: 'До', detail: 'Крупный блок фильтров; данные для сверки разнесены по странице', tone: 'problem' },
        { label: 'После', detail: 'Фильтры в строке над таблицей; статус и финансовые данные сгруппированы; переход в детали остаётся рядом с ордером', tone: 'solution' },
      ],
    },
    {
      id: 'portal-disclosure', group: 'concept', after: 'API-запрос убрала в раскрываемый блок', title: 'Детали без лишней технической плотности', kind: 'comparison',
      presentation: 'comparison',
      items: [
        { label: 'Первый уровень', detail: 'Статус, суммы, комиссии и данные клиента видны сразу', tone: 'neutral' },
        { label: 'Раскрытый уровень', detail: 'Исходный API-запрос и JSON доступны по запросу для диагностики', tone: 'neutral' },
      ],
    },
    {
      id: 'portal-diagnostics', group: 'concept', after: 'Так можно проверить обмен данными', title: 'Два уровня диагностики', kind: 'comparison',
      presentation: 'comparison',
      items: [
        { label: 'Операция', detail: 'Какой у ордера финансовый статус и какие суммы нужно сверить?', tone: 'neutral' },
        { label: 'Уведомление', detail: 'Было ли событие доставлено в систему партнёра? Что содержат запрос и ответ?', tone: 'neutral' },
      ], caption: 'Один и тот же ордер проверяется на двух уровнях: результат обмена и доставка события',
    },
    {
      id: 'portal-states', group: 'concept', after: 'ошибка всего экрана', title: 'Состояния дашборда', kind: 'matrix',
      presentation: 'states',
      items: [
        { label: 'Загрузка', detail: 'Данные ещё поступают', note: 'Показать состояние ожидания', tone: 'neutral' },
        { label: 'Пустой период', detail: 'За выбранный период нет операций', note: 'Изменить период', tone: 'neutral' },
        { label: 'Ошибка виджета', detail: 'Часть данных недоступна', note: 'Оставить доступные данные и повторить загрузку блока', tone: 'problem' },
        { label: 'Ошибка экрана', detail: 'Общая загрузка не удалась', note: 'Повторить запрос', tone: 'problem' },
      ],
    },
    {
      id: 'portal-mobile', group: 'concept', after: 'детали операции выстроены', title: 'Та же задача на узком экране', kind: 'columns',
      columns: ['Десктоп', 'Мобильный экран', 'Что сохраняется'],
      items: [
        { label: 'Строка таблицы', detail: 'Карточка ордера', note: 'Статус и данные для первичной проверки' },
        { label: 'Панель фильтров', detail: 'Нижняя панель', note: 'Поиск и уточнение списка' },
        { label: 'Боковая навигация', detail: 'Меню', note: 'Доступ к рабочим разделам' },
      ],
    },
    {
      id: 'portal-components', group: 'system', after: 'загрузка, пустые и ошибочные состояния', title: 'Повторно используемые элементы', kind: 'matrix',
      items: [
        { label: 'Фильтр и поле', detail: 'Поиск, период и ввод данных', note: 'Обычное, активное и ошибочное состояния' },
        { label: 'Кнопка и статус', detail: 'Действия и обратная связь', note: 'Доступное и недоступное действие' },
        { label: 'Ордер', detail: 'Строка таблицы или мобильная карточка', note: 'Один набор данных в разных компоновках' },
        { label: 'Диалог', detail: 'Изменение комиссии и подтверждение', note: 'Явное сохранение или отмена' },
      ],
    },
  ],
  skywallet: [
    {
      id: 'wallet-ecosystem', group: 'context', after: 'Продукт объединял два ключевых сценария', title: 'Два контура одной экосистемы', kind: 'comparison',
      presentation: 'comparison',
      items: [
        { label: 'SkyWallet', detail: 'Некастодиальный кошелёк: пользователь самостоятельно хранит активы и управляет ключами', tone: 'neutral' },
        { label: 'Sky Capital', detail: 'Биржевой контур: обмен, пополнение и вывод через платформу', tone: 'neutral' },
      ],
    },
    {
      id: 'wallet-entities', group: 'context', after: 'пользователи плохо различают', title: 'Сущности, которые нельзя смешивать', kind: 'flow',
      items: [
        { label: 'Wallet', detail: 'Кошелёк' },
        { label: 'Account', detail: 'Аккаунт' },
        { label: 'Network', detail: 'Сеть' },
        { label: 'Asset', detail: 'Актив' },
        { label: 'Address', detail: 'Адрес получения или отправки' },
      ],
    },
    {
      id: 'wallet-risks', group: 'context', after: 'не учесть сетевую комиссию', title: 'Карта ошибок пользователя', kind: 'matrix',
      presentation: 'risks',
      items: [
        { label: 'Seed-фраза', detail: 'Потеря доступа без возможности восстановления через поддержку', tone: 'problem' },
        { label: 'Сеть и адрес', detail: 'Перевод с несовместимыми параметрами', tone: 'problem' },
        { label: 'Комиссия', detail: 'Недостаточно средств для завершения отправки', tone: 'problem' },
        { label: 'Тип счёта', detail: 'Путаница между личным кошельком и биржевым балансом', tone: 'problem' },
      ],
    },
    {
      id: 'wallet-contours', group: 'context', after: 'В биржевом контуре средства', title: 'Разные правила хранения и доступа', kind: 'comparison',
      presentation: 'comparison',
      items: [
        { label: 'Некастодиальный кошелёк', detail: 'Ключи и seed-фраза у пользователя. Поддержка не восстанавливает доступ', note: 'Чувствительные действия подтверждаются локальным паролем', tone: 'neutral' },
        { label: 'Биржевой счёт', detail: 'Средства находятся на стороне платформы. Для операций с рублями требуется идентификация', note: 'Сценарий подчиняется правилам биржевого контура', tone: 'neutral' },
      ],
    },
    {
      id: 'wallet-architecture', group: 'structure', after: 'Построила общую карту продукта', title: 'Архитектура MVP', kind: 'levels',
      items: [
        { label: 'Вход и безопасность', detail: 'Онбординг, создание и импорт, seed-фраза, пароль, восстановление' },
        { label: 'Кошелёк', detail: 'Wallet, Account, сети, активы, детали и история' },
        { label: 'Операции', detail: 'Отправка, получение, DEX-обмен и биржевой сценарий' },
      ],
    },
    {
      id: 'wallet-onboarding', group: 'structure', after: 'Восстановление доступа через повторный импорт', title: 'Онбординг и восстановление', kind: 'flow', numbered: true,
      items: [
        { label: 'Создать или импортировать', detail: 'Выбор пути входа' },
        { label: 'Seed-фраза', detail: 'Просмотр и подтверждение порядка слов' },
        { label: 'Локальный пароль', detail: 'Защита доступа в приложении' },
        { label: 'Восстановление', detail: 'При потере пароля — повторный импорт через seed-фразу' },
      ],
    },
    {
      id: 'wallet-send', group: 'structure', after: 'Отслеживание статуса', title: 'Отправка: контроль на каждом шаге', kind: 'flow', numbered: true,
      items: [
        { label: 'Актив', detail: 'Выбрать актив и увидеть доступный баланс' },
        { label: 'Адрес', detail: 'Ввести или сканировать; проверить формат и сеть' },
        { label: 'Сумма и комиссия', detail: 'Убедиться, что баланса достаточно' },
        { label: 'Проверка', detail: 'Повторно увидеть сумму, адрес, сеть и fee' },
        { label: 'Подтверждение', detail: 'Отправить и отслеживать статус' },
      ],
    },
    {
      id: 'wallet-receive', group: 'structure', after: 'Предупреждение о переводе только', title: 'Получение средств', kind: 'flow', numbered: true,
      presentation: 'steps',
      items: [
        { label: 'Актив и сеть', detail: 'Определить контекст получения' },
        { label: 'Адрес или QR', detail: 'Скопировать адрес или показать код' },
        { label: 'Предупреждение', detail: 'Перевод возможен только в выбранной сети' },
      ],
    },
    {
      id: 'wallet-context', group: 'concept', after: 'Это снижало вероятность отправки', title: 'Контекст активной операции', kind: 'levels',
      items: [
        { label: 'Откуда', detail: 'Wallet и Account' },
        { label: 'Что', detail: 'Network, Asset и доступный баланс' },
        { label: 'Куда', detail: 'Адрес, сумма и комиссия перед подтверждением' },
      ],
    },
    {
      id: 'wallet-send-design', group: 'concept', after: 'Перед отправкой ещё раз показывала', title: 'От формы к пошаговому сценарию', kind: 'comparison',
      presentation: 'before-after',
      items: [
        { label: 'Ранний подход', detail: 'Все поля и контекст операции в одной форме', tone: 'problem' },
        { label: 'Финальная логика', detail: 'Выбор актива → ввод данных → проверка → подтверждение', tone: 'solution' },
      ],
    },
    {
      id: 'wallet-seed', group: 'concept', after: 'дополнительного подтверждения', title: 'Доступ к seed-фразе', kind: 'flow', numbered: true,
      items: [
        { label: 'Предупреждение', detail: 'Объяснить риск раскрытия' },
        { label: 'Локальный пароль', detail: 'Подтвердить право доступа' },
        { label: 'Подтверждение', detail: 'Показать чувствительные данные после явного действия' },
      ],
    },
    {
      id: 'wallet-errors', group: 'concept', after: 'неподдерживаемая сеть', title: 'Предотвращение ошибок', kind: 'columns',
      columns: ['Ситуация', 'Обратная связь', 'Следующее действие'],
      items: [
        { label: 'Невалидный адрес', detail: 'Ошибка в поле', note: 'Исправить адрес' },
        { label: 'Неверная сеть', detail: 'Предупреждение', note: 'Сменить сеть' },
        { label: 'Недостаточно баланса', detail: 'Ошибка', note: 'Уменьшить сумму' },
        { label: 'Не хватает на комиссию', detail: 'Предупреждение', note: 'Пополнить актив для комиссии' },
        { label: 'Операция в обработке', detail: 'Статус', note: 'Дождаться подтверждения' },
        { label: 'Неудачная операция', detail: 'Ошибка', note: 'Проверить параметры или повторить' },
      ],
    },
    {
      id: 'wallet-states', group: 'concept', after: 'Пользователь мог понимать', title: 'Состояния транзакции', kind: 'matrix',
      items: [
        { label: 'Pending', detail: 'Операция обрабатывается', note: 'Ожидать результат' },
        { label: 'Success', detail: 'Операция завершена', note: 'Просмотреть детали' },
        { label: 'Failed', detail: 'Операция не завершилась', note: 'Проверить причину и параметры' },
        { label: 'Loading / Empty', detail: 'Загрузка или отсутствие истории', note: 'Различать ожидание и пустой результат' },
      ],
    },
    {
      id: 'wallet-components', group: 'system', after: 'Компоненты создавались с учётом', title: 'Система состояний', kind: 'matrix',
      items: [
        { label: 'Ввод и выбор', detail: 'Поля и селекторы', note: 'Обычное, активное, ошибочное' },
        { label: 'Действие', detail: 'Кнопки подтверждения', note: 'Доступное, недоступное, загрузка' },
        { label: 'Актив', detail: 'Карточка и детали', note: 'Баланс, сеть и контекст' },
        { label: 'Обратная связь', detail: 'Предупреждения и статусы', note: 'Риск, ожидание, успех, ошибка' },
      ],
    },
    {
      id: 'wallet-handoff', group: 'system', after: 'уточняла бизнес-логику', title: 'От логики к передаче в разработку', kind: 'flow', numbered: true,
      presentation: 'steps',
      items: [
        { label: 'Бизнес-логика', detail: 'Согласование MVP и финансовых контуров' },
        { label: 'Сценарии', detail: 'Архитектура и состояния' },
        { label: 'Прототип', detail: 'Проверка последовательности действий' },
        { label: 'Спецификации', detail: 'Компоненты, ошибки и ограничения для разработки' },
      ],
    },
  ],
}

export function visualsAfter(projectId: string, group: string, text: string): CaseVisualSpec[] {
  return (caseVisuals[projectId] ?? []).filter((visual) => visual.group === group && text.includes(visual.after))
}
