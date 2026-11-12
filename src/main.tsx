import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import { InitialLoader } from './components/InitialLoader'
import { LocaleProvider } from './i18n/LocaleContext.tsx'
import '@fontsource-variable/manrope'
import './styles/localization.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/globals.css'
import './styles/adaptive.css'
import './styles/portfolioSystem.css'
import './styles/portfolioStory.css'
import './styles/storySite.css'
import './styles/showcase.css'
import './styles/showcaseInner.css'

// Set this before React mounts, before the browser can restore a stale canvas offset.
window.history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LocaleProvider>
        <App />
        <InitialLoader />
      </LocaleProvider>
    </MotionConfig>
  </StrictMode>,
)
