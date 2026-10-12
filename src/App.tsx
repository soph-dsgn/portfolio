import { useLayoutEffect, useRef } from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { HomeCanvas } from './components/HomeCanvas'
import { savedPageScroll, savePageScroll } from './lib/pageScroll'
import { ExperiencePage } from './pages/ExperiencePage'
import { cancelSectionNavigation, navigateToSection } from './lib/canvasNavigation'
import { ProjectPage } from './pages/ProjectPage'
import { profile } from './data/portfolio'
import { ScrollReveals } from './components/ScrollReveals'
import { MobileHeader } from './components/MobileHeader'
import { CaseHeader } from './components/CaseHeader'
import { CopyrightPage } from './pages/CopyrightPage'
import { useCaseScrollTracking, usePageTracking } from './hooks/useAnalyticsTracking'
import { useLocale } from './i18n/locale'

function AnalyticsTracking() {
  usePageTracking()
  useCaseScrollTracking()
  return null
}

function ScrollToPage() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const previousPath = useRef<string | null>(null)
  useLayoutEffect(() => {
    cancelSectionNavigation()
    if (previousPath.current !== null && previousPath.current !== pathname) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
    // HomeCanvas owns home positioning after its real scroll range is committed.
    // Two owners here would race the initial vertical/horizontal layout switch.
    if (pathname === '/') {
      previousPath.current = pathname
      return
    }
    const restored = navigationType === 'POP' ? savedPageScroll(key) : undefined
    if (restored !== undefined) {
      window.scrollTo({ top: restored, behavior: 'instant' })
    } else if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target && pathname.startsWith('/projects/')) {
        navigateToSection(target, previousPath.current === pathname ? 'smooth' : 'instant')
      } else target?.scrollIntoView({ behavior: previousPath.current === pathname && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' })
    } else if (previousPath.current !== pathname || pathname === '/' || pathname === '/experience')
      window.scrollTo({ top: 0, behavior: 'instant' })
    previousPath.current = pathname
    return () => savePageScroll(key, window.scrollY)
  }, [pathname, hash, key, navigationType])
  return null
}
function HomePage() {
  const { t } = useLocale()
  useLayoutEffect(() => { document.title = `${t(profile.name)} — ${t(profile.role)}` }, [t])
  return <HomeCanvas />
}
function SiteHeader() {
  const { pathname } = useLocation()
  return pathname.startsWith('/projects/') ? <CaseHeader key={pathname} /> : <MobileHeader showBack={pathname === '/copyright'} />
}
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <ScrollToPage />
      <AnalyticsTracking />
      <ScrollReveals />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/copyright" element={<CopyrightPage />} />
        <Route
          path="*"
          element={
            <main className="not-found" id="main-content" tabIndex={-1}>
              <h1>Страница не найдена</h1>
              <Link className="button" to="/">
                На главную
              </Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
export default App
