let primaryFontReady: Promise<void> | undefined

/** Resolve only the Onest face used by the first screen, not every document font. */
export function waitForPrimaryFont() {
  if (!('fonts' in document)) return Promise.resolve()
  primaryFontReady ??= document.fonts.load('500 1em Onest', 'Софья').then(() => undefined, () => undefined)
  return primaryFontReady
}

/** Wait for the routed main element, including a lazy route, without waiting
 * for window.load or offscreen media. The loader's fail-safe remains the cap. */
export function waitForReactLayout() {
  return new Promise<void>(resolve => {
    const check = () => {
      const main = document.getElementById('main-content')
      if (main && main.getBoundingClientRect().width > 0) requestAnimationFrame(() => resolve())
      else requestAnimationFrame(check)
    }
    check()
  })
}

