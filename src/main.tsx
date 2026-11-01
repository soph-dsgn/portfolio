import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { InitialLoader } from './components/InitialLoader'
import { LocaleProvider } from './i18n/LocaleContext.tsx'
import './styles/localization.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/globals.css'
import './styles/homeCanvas.css'
import './styles/adaptive.css'
import './styles/figmaHome.css'

// Set this before React mounts, before the browser can restore a stale canvas offset.
window.history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <App />
      <InitialLoader />
    </LocaleProvider>
  </StrictMode>,
)
