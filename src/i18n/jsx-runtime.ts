import { createElement, Fragment, type ElementType, type ReactNode } from 'react'
import { jsx as reactJsx, jsxs as reactJsxs, type JSX } from 'react/jsx-runtime'
import { useLocale } from './locale'
import { isMotionComponent } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import { bindShortWords } from '../lib/typography'
export { Fragment }
export type { JSX }
const types = new Map<unknown, ElementType>()
const copyProps = ['aria-label', 'aria-description', 'aria-valuetext', 'alt', 'title', 'placeholder', 'data-label']
/** Raw text elements keep their text as written: no translation lookups, no non-breaking spaces. */
const rawText = new Set(['code', 'pre', 'style', 'script', 'textarea'])
export function localizedType(type: ElementType): ElementType {
  // Preserve component identity: routers and presence systems inspect their children.
  // Translate only the final DOM boundary (including Motion's DOM components).
  if (typeof type !== 'string' && type !== Link && type !== NavLink && !isMotionComponent(type)) return type
  let localized = types.get(type)
  if (!localized) {
    localized = function LocalizedElement(props: Record<string, unknown>) {
      const { t } = useLocale()
      // Every visible string is translated, and short prepositions and conjunctions are tied to the next word,
      // so no line on the site ends with a hanging «в», «с» or «и».
      const children = (value: ReactNode): ReactNode => typeof value === 'string' ? bindShortWords(t(value)) : Array.isArray(value) ? value.map(children) : value
      const next = { ...props }
      if (typeof type !== 'string' || !rawText.has(type)) next.children = children(props.children as ReactNode)
      for (const name of copyProps) if (typeof props[name] === 'string') next[name] = t(props[name] as string)
      const content = next.children as ReactNode
      return createElement(type, next, ...(Array.isArray(content) ? content : [content]))
    }
    types.set(type, localized)
  }
  return localized
}
export const jsx: typeof reactJsx = (type, props, key) => reactJsx(type === Fragment ? type : localizedType(type), props, key)
export const jsxs: typeof reactJsxs = (type, props, key) => reactJsxs(type === Fragment ? type : localizedType(type), props, key)

