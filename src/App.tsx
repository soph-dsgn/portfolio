import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { ShowcaseHome } from './pages/ShowcaseHome'
import { savedPageScroll, savePageScroll } from './lib/pageScroll'
import { cancelSectionNavigation, navigateToSection } from './lib/canvasNavigation'
import { ScrollReveals } from './components/ScrollReveals'
import { ShowcaseDock, ShowcaseTopBar, ShowcaseBottomFade } from './components/ShowcaseChrome'
import { CaseHeader } from './components/CaseHeader'
import { CopyrightPage } from './pages/CopyrightPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { useCaseScrollTracking, usePageTracking } from './hooks/useAnalyticsTracking'
import { UISoundProvider } from './lib/uiSound'
import { PrivacySettings } from './components/PrivacySettings'

const ProjectPage = lazy(() => import('./pages/ProjectPage').then(module => ({ default: module.ProjectPage })))

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
    if (previousPath.current !== null && previousPath.current !== pathname) {
      cancelSectionNavigation()
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
    cancelSectionNavigation()
    const restored = navigationType === 'POP' ? savedPageScroll(key) : undefined
    if (restored !== undefined) {
      window.scrollTo({ top: restored, behavior: 'instant' })
    } else if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target && pathname.startsWith('/projects/')) {
        navigateToSection(target, previousPath.current === pathname ? 'smooth' : 'instant')
      } else target?.scrollIntoView({ behavior: previousPath.current === pathname && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' })
    } else if (previousPath.current !== pathname || pathname === '/')
      window.scrollTo({ top: 0, behavior: 'instant' })
    previousPath.current = pathname
    return () => savePageScroll(key, window.scrollY)
  }, [pathname, hash, key, navigationType])
  return null
}
function SiteHeader() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return pathname.startsWith('/projects/') ? <CaseHeader key={pathname} /> : <ShowcaseTopBar />
}
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UISoundProvider>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <ScrollToPage />
      <AnalyticsTracking />
      <ScrollReveals />
      <ShowcaseBottomFade />
      <SiteHeader />
      <Suspense fallback={null}><Routes>
        <Route path="/" element={<ShowcaseHome />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/copyright" element={<CopyrightPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="*"
          element={
            <main className="not-found" id="main-content" tabIndex={-1}>
              <h1>Кажется, такой страницы у меня нет</h1>
              <Link className="button" to="/">
                На главную
              </Link>
            </main>
          }
        />
      </Routes></Suspense>
      <ShowcaseDock />
      <PrivacySettings banner />
      </UISoundProvider>
    </BrowserRouter>
  )
}
export default App
