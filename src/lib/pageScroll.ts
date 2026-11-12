// In-memory positions belong to history entries in this document. A reload or
// new tab deliberately has no restoration intent, even if the browser has one.
const positions = new Map<string, { top: number; hash?: string }>()
export const savedPageScroll = (key: string, hash?: string) => {
  const position = positions.get(key)
  return position && (hash === undefined || hash === position.hash) ? position.top : undefined
}
export const savePageScroll = (key: string, top: number, hash?: string) => { positions.set(key, { top, hash }) }
