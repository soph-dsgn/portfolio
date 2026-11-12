import type { CaseNode } from '../data/caseContent'

export function isNarrativeLead(node: CaseNode) {
  return node.kind === 'paragraph' && node.text.length <= 180 && /:\s*$/.test(node.text)
}

export function audienceStatementLength(node: CaseNode) {
  if (node.kind !== 'paragraph' || !/^(Основными пользователями|Целевой аудиторией)/.test(node.text)) return 0
  const end = node.text.indexOf('. ')
  return end >= 0 ? end + 1 : node.text.length
}

