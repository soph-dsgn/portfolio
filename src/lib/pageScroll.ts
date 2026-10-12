// In-memory positions belong to history entries in this document. A reload or
// new tab deliberately has no restoration intent, even if the browser has one.
const positions = new Map<string, { top: number; hash?: string }>()
let homeEntry: string | undefined
let homeHash = ''
export const savedPageScroll = (key: string, hash?: string) => {
  const position = positions.get(key)
  return position && (hash === undefined || hash === position.hash) ? position.top : undefined
}
export const savePageScroll = (key: string, top: number, hash?: string) => { positions.set(key, { top, hash }) }
export const activateHomeScroll = (key: string, hash: string) => { homeEntry = key; homeHash = hash }
export const deactivateHomeScroll = (key: string) => { if (homeEntry === key) homeEntry = undefined }
export const captureHomeScroll = (key: string) => {
  if (homeEntry === key) savePageScroll(key, window.scrollY, homeHash)
}
