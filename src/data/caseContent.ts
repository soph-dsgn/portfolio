import type { CaseBlock, Project } from './portfolio'

export type CaseGroupId = 'context' | 'structure' | 'concept' | 'system' | 'final'

export type CaseNode =
  | { kind: 'heading'; text: string; level: 3 | 4 }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }

export type CaseGroup = {
  id: CaseGroupId
  title: string
  nodes: CaseNode[]
}

export function withoutFinalPeriod(text: string) {
  const trimmed = text.trimEnd()
  if (!trimmed.endsWith('.') || /\.\.{1,}$/.test(trimmed) ||
    /(?:^|\s)\p{Lu}\.$/u.test(trimmed) ||
    /(?:\p{L}\.\s*\p{L}\.|(?:^|\s)(?:г|гг|п|с|д|т|ч|л|м|млн|млрд|тыс|руб|см|др|пр|стр|рис|табл|пп|коп|чел|мин|сек|напр|etc|vs)\.)$/iu.test(trimmed))
    return text
  return trimmed.slice(0, -1) + text.slice(trimmed.length)
}

const groupTitles: Record<CaseGroupId, string> = {
  context: 'Контекст',
  structure: 'Стратегия и сценарии',
  concept: 'UX/UI-решения',
  system: 'Система и команда',
  final: 'Результаты и выводы',
}

function groupForHeading(text: string): CaseGroupId | undefined {
  if (text === 'О проекте' || text === 'Discovery' || text === 'Исходная ситуация') return 'context'
  if (text === 'Продуктовая стратегия' || text === 'Проектирование сценариев')
    return 'structure'
  if (text === 'UX/UI-решения' || text === 'UX/UI решения') return 'concept'
  if (text === 'Системный подход' || text === 'Работа с командой') return 'system'
  if (text === 'Результаты' || text.startsWith('Рефлексия')) return 'final'
  return undefined
}

const bulletPrefix = /^\s*[•—>-]\s*/

// Source documents use plain paragraphs for a few named subtopics. Keep that
// semantic information here instead of inferring headings from their position.
const namedSubtopics = new Set([
  'Ключевые инсайты', 'Основной JTBD', 'Дополнительный JTBD',
  'Контроль бизнеса', 'Операционная работа', 'Диагностика и самообслуживание',
  'Главный продуктовый принцип', 'Логика выбора решения',
  'Контроль работы обменника', 'Поиск и проверка ордера',
  'Диагностика интеграции', 'Изменение комиссии',
  'Дашборд для общей картины', 'Компактные фильтры',
  'Последовательное чтение деталей', 'Проверка доставки вебхуков',
  'Явное изменение финансовых настроек', 'Документация в рабочем контексте',
  'Управление командой', 'Разные причины — разные состояния', 'Мобильная работа',
  'Выбранное решение',
])

const introducingLines = new Set([
  'Кабинет разделён на три уровня работы',
  'Структура кабинета объединяет несколько самостоятельных пользовательских путей',
])

const orderedTopics = new Set([
  'Контроль работы обменника', 'Поиск и проверка ордера',
  'Диагностика интеграции', 'Изменение комиссии', 'Управление активами',
  'Отправка средств', 'Получение средств', 'Обмен',
])

function appendList(nodes: CaseNode[], items: string[]) {
  if (!items.length) return
  const previous = nodes[nodes.length - 1]
  if (previous?.kind === 'list') previous.items.push(...items)
  else {
    const heading = nodes.findLast(node => node.kind === 'heading')
    // These source topics describe ordered actions, rather than categories or findings.
    const ordered = heading?.kind === 'heading' && orderedTopics.has(heading.text.trim())
    nodes.push({ kind: 'list', items, ordered })
  }
}

function appendBlock(nodes: CaseNode[], block: CaseBlock) {
  if (block.kind.startsWith('HEADING_') || namedSubtopics.has(block.text.trim())) {
    nodes.push({
      kind: 'heading',
      text: block.text,
      level: block.kind === 'HEADING_3' || block.kind === 'HEADING_4' || namedSubtopics.has(block.text.trim()) ? 4 : 3,
    })
    return
  }

  const lines = block.text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return
  // Arrow-delimited source paths are explicit sequences; findings stay unordered.
  if (lines.length > 1 && lines.slice(1).every(line => line.startsWith('→'))) {
    nodes.push({ kind: 'list', ordered: true, items: lines.map(line => line.replace(/^→\s*/, '')) })
    return
  }
  const prose: string[] = []
  const bullets: string[] = []
  for (const line of lines) {
    if (block.bullet || bulletPrefix.test(line)) {
      bullets.push(line.replace(bulletPrefix, ''))
    } else {
      if (bullets.length) {
        if (prose.length) nodes.push({ kind: 'paragraph', text: prose.join(' ') })
        appendList(nodes, bullets.splice(0))
        prose.length = 0
      }
      prose.push(line)
    }
  }
  if (prose.length) {
    const text = prose.join(' ')
    nodes.push({ kind: 'paragraph', text: introducingLines.has(text) ? `${text}:` : text })
  }
  appendList(nodes, bullets)
}

export function getCaseGroups(project: Project): CaseGroup[] {
  const groups = (Object.keys(groupTitles) as CaseGroupId[]).map((id) => ({
    id,
    title: groupTitles[id],
    nodes: [] as CaseNode[],
  }))
  let current = groups[0]
  for (let index = 1; index < project.document.length; index += 1) {
    const block = project.document[index]
    const text = block.text.trim()
    if (!text || /^(Роль|Платформа|Ниша|Индустрия):/.test(text)) continue
    const nextGroup = groupForHeading(text)
    if (nextGroup) {
      current = groups.find((group) => group.id === nextGroup) ?? current
      // The section heading already names its opening topic.
      if (current.nodes.length === 0) continue
    }
    appendBlock(
      current.nodes,
      nextGroup && block.kind === 'NORMAL_TEXT'
        ? { ...block, kind: 'HEADING_2' }
        : block,
    )
  }
  return groups.filter((group) => group.nodes.length > 0)
}

export function getCaseNavigationSections(project: Project) {
  if (project.videos) return project.videos.map(video => ({
    id: video.id, label: video.shortTitle,
  }))
  return getCaseGroups(project)
    .filter(group => ['context', 'concept', 'final'].includes(group.id))
    .map(group => ({ id: group.id, label: group.id === 'concept' ? 'UX/UI-решение' : group.title }))
}
