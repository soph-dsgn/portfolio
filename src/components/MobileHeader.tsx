import { captureHomeScroll } from '../lib/pageScroll'
import { useActiveConcept } from '../lib/useActiveConcept'
import { useLocale } from '../i18n/locale'
import { motionTokens, useMotionSystem } from '../lib/motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { projects, profile } from '../data/portfolio'
import { getCaseNavigationSections } from '../data/caseContent'
import { bindShortWords } from '../lib/typography'
import { TelegramLink } from './ContactLinks'
import { trackEvent } from '../lib/analytics'
import { publicAsset } from '../lib/publicAsset'
import { Icon } from './Icon'
import { navigateToSection } from '../lib/canvasNavigation'
import { BackButton } from './BackButton'
import { LanguageSelector } from './LanguageSelector'
import { NavigationLabel } from './NavigationLabel'

const MotionLink = motion.create(Link)

const homeLinks = [
  { href: '/#work', label: 'Кейсы' },
  { href: '/#about', label: 'Обо мне' },
]

export function MobileHeader({ showBack = false, backTo = '/' }: { showBack?: boolean; backTo?: string }) {
  const { locale } = useLocale()
  const { variants, navInteraction } = useMotionSystem()
  const location = useLocation()
  const { pathname, search } = location
  const navigate = useNavigate()
  const anchorFrame = useRef(0)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const [activePageSection, setActiveSection] = useState('')
  const reducedMotion = useReducedMotion()
  const press = navInteraction
  const menuKey = pathname + search
  const open = openFor === menuKey
  const headerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isCase = pathname.startsWith('/projects/')
  const isConcept = projects.some(project => project.videos && pathname === `/projects/${project.id}`)
  const sections = useMemo(() => {
    const project = projects.find(project => pathname === `/projects/${project.id}`)
    return project ? getCaseNavigationSections(project) : []
  }, [pathname])
  const activeConcept = useActiveConcept(isConcept ? sections.map(section => section.id) : [])
  const activeSection = isConcept ? activeConcept : activePageSection
  const isActiveLink = (href: string) => href.includes('#')
    ? pathname === '/' && activeSection === href.split('#')[1]
    : pathname === href

  useEffect(() => {
    if (isConcept) return
    const ids = isCase
      ? sections.map(({ id }) => id)
      : homeLinks.filter(({ href }) => href.includes('#')).map(({ href }) => href.split('#')[1])
    let frame = 0
    const update = () => {
      frame = 0
      const canvas = document.querySelector('.home-canvas[data-horizontal="true"]')
      if (!isCase && canvas) {
        const first = canvas.querySelector<HTMLElement>('[data-project]')
        const about = canvas.querySelector<HTMLElement>('#about')
        const next = canvas.querySelector<HTMLElement>('[data-project="partner-portal"]')
        const center = document.documentElement.clientWidth / 2
        const inAbout = about && about.getBoundingClientRect().left <= center && next && next.getBoundingClientRect().left > center
        setActiveSection(inAbout ? 'about' : first && first.getBoundingClientRect().left <= center ? 'work' : '')
        return
      }
      const line = (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 36
      const targets = ids.flatMap((id) => {
        const element = document.getElementById(id)
        return element ? [{ id, top: element.getBoundingClientRect().top }] : []
      }).sort((a, b) => a.top - b.top)
      let next = targets[0]?.id ?? ''
      for (const target of targets) if (target.top <= line) next = target.id
      if (isCase && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2)
        next = sections.at(-1)?.id ?? next
      setActiveSection(next)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [pathname, isCase, isConcept, sections])

  // Reveal the active concept inside the pill, without moving the page.
  useEffect(() => {
    if (!isConcept) return
    const nav = navRef.current
    const link = nav?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!nav || !link || !nav.clientWidth) return
    const bounds = nav.getBoundingClientRect()
    const item = link.getBoundingClientRect()
    const inset = parseFloat(getComputedStyle(nav).paddingLeft) || 0
    if (item.left < bounds.left + inset || item.right > bounds.right - inset)
      nav.scrollTo({ left: nav.scrollLeft + item.left - bounds.left - (bounds.width - item.width) / 2,
        behavior: reducedMotion ? 'instant' : 'smooth' })
  }, [isConcept, activeSection, locale, reducedMotion])

  useEffect(() => {
    if (!open) return
    const mobile = window.matchMedia('(max-width: 1100px)')
    if (!mobile.matches) return
    const rootOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setOpenFor(null)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFor(null)
        buttonRef.current?.focus()
      }
      if (event.key === 'Tab') {
const links = headerRef.current?.querySelectorAll<HTMLElement>('.mobile-header-inner a, .mobile-header-inner button, .mobile-menu a, .mobile-menu button')
        const first = links?.[0]
        const last = links?.[links.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    const onResize = () => { if (!mobile.matches) setOpenFor(null) }
    mobile.addEventListener('change', onResize)
    return () => {
      document.documentElement.style.overflow = rootOverflow
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      mobile.removeEventListener('change', onResize)
    }
  }, [open])

  useEffect(() => () => cancelAnimationFrame(anchorFrame.current), [])

  function navigateHomeAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const id = href.split('#')[1]
    if (!id) return
    const target = pathname === '/' ? document.getElementById(id) : null
    if (pathname === '/' && !target) return
    event.preventDefault()
    cancelAnimationFrame(anchorFrame.current)
    captureHomeScroll(location.key)
    setOpenFor(null)
    // PUSH marks an interactive intent. Reload/POP ignores it, so direct hash
    // entries remain instant and saved history entries restore their position.
    navigate(href, { state: { animateAnchor: true, anchorOriginPath: pathname } })
    if (!target) return // HomeCanvas consumes cross-route intent after positioning.
    // Router commit + mobile menu unlock precede the shared scroll animation.
    anchorFrame.current = requestAnimationFrame(() => {
      anchorFrame.current = 0
      if (!target.isConnected) return
      target.tabIndex = -1
      target.focus({ preventScroll: true })
      navigateToSection(target, reducedMotion ? 'instant' : 'smooth')
    })
  }

  function closeAtSection(id: string) {
    setActiveSection(id)
    setOpenFor(null)
    requestAnimationFrame(() => {
      const section = document.getElementById(id)
      if (!section) return
      section.tabIndex = -1
      section.focus({ preventScroll: true })
      navigateToSection(section, reducedMotion ? 'instant' : 'smooth')
    })
  }

  return (
    <motion.header initial="hidden" animate="visible" variants={variants('fade')} className={`site-header mobile-header${pathname === '/' ? ' site-header--home' : isCase ? ` site-header--case${isConcept ? ' site-header--concept' : ''}` : ''}`} ref={headerRef}>
      <div className={`desktop-header${showBack ? ' desktop-header--back' : ''}`}>
        {showBack && <BackButton to={backTo} />}
        <nav ref={navRef} className="header-navigation" aria-label={isCase ? 'Разделы кейса' : 'Главная навигация'}>
          {isCase ? sections.map(section => <motion.a key={section.id} {...navInteraction}
            href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}
            onClick={event => {
              if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault(); closeAtSection(section.id)
            }}><NavigationLabel active={activeSection === section.id}>{bindShortWords(section.label)}</NavigationLabel></motion.a>) : <>
          {homeLinks.map(link => <MotionLink key={link.href} {...navInteraction} to={link.href}
            onClick={event => navigateHomeAnchor(event, link.href)}
            aria-current={isActiveLink(link.href) ? (link.href.includes('#') ? 'location' : 'page') : undefined}><NavigationLabel active={isActiveLink(link.href)}>{bindShortWords(link.label)}</NavigationLabel></MotionLink>)}
          <motion.a {...navInteraction} href={profile.cv} aria-disabled={!profile.cv || undefined} target="_blank" rel="noreferrer" onClick={profile.cv ? () => trackEvent('resume_click', { location: 'header' }) : undefined}><NavigationLabel>CV</NavigationLabel></motion.a></>}
        </nav>
        <div className="header-actions">
          <TelegramLink location="header" label="TG" />
        </div>
        <LanguageSelector />
      </div>
      <AnimatePresence>{open && <motion.div className="mobile-menu-backdrop" data-open="true" aria-hidden="true"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? motionTokens.reduced : motionTokens.navState, ease: motionTokens.ease }} onClick={() => setOpenFor(null)} />}</AnimatePresence>
      <div className={`mobile-header-inner${isCase ? ' mobile-header-inner--case' : ' mobile-header-inner--home'}${showBack ? ' mobile-header-inner--back' : ''}`}>
        {showBack ? <><BackButton to={backTo} /><div className="mobile-header-spacer" /></> : <Link
          className="mobile-brand"
          to="/"
          aria-label="На главную"
          onClick={() => setOpenFor(null)}
        >
          <img src={publicAsset('icons/favicon/Logo 64 — Light.svg')} alt="" width="32" height="32" />
          <span>{profile.name}</span>
        </Link>}
        <TelegramLink location="mobile-header" compact />
        <motion.button {...press}
          className="icon-action mobile-menu-toggle"
          type="button"
          ref={buttonRef}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenFor(open ? null : menuKey)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </motion.button>
      </div>
      <motion.nav
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Мобильное меню"
        data-open={open}
        aria-hidden={!open}
        inert={!open}
        initial={false}
        animate={{ opacity: open ? 1 : 0, transform: reducedMotion ? 'none' : open ? 'translateY(0px)' : 'translateY(-6px)' }}
        transition={{ duration: reducedMotion ? motionTokens.reduced : motionTokens.menu, ease: motionTokens.ease }}
      >
        <LanguageSelector />
        {isCase ? (
          <>
            <MotionLink {...navInteraction} to="/" onClick={() => setOpenFor(null)} style={{ ...navInteraction.style, '--menu-order': 0 } as CSSProperties}>
              <NavigationLabel className="mobile-menu-link-label">Кейсы</NavigationLabel>
            </MotionLink>
            <MotionLink {...navInteraction} to="/#about" onClick={() => setOpenFor(null)} style={{ ...navInteraction.style, '--menu-order': 1 } as CSSProperties}>
              <NavigationLabel className="mobile-menu-link-label">Обо мне</NavigationLabel>
            </MotionLink>
            {sections.length > 0 && <span className="mobile-menu-label" style={{ '--menu-order': 2 } as CSSProperties}>Разделы кейса</span>}
            {sections.map((section, index) => (
              <motion.a key={section.id} {...navInteraction}
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'location' : undefined}
                onClick={event => {
                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault(); closeAtSection(section.id)
                }}
                style={{ ...navInteraction.style, '--menu-order': index + 3 } as CSSProperties}
              >
                <NavigationLabel active={activeSection === section.id} className="mobile-menu-link-label">{bindShortWords(section.label)}</NavigationLabel>
              </motion.a>
            ))}
          </>
        ) : (
          homeLinks.map((link, index) => (
            <MotionLink key={link.href} {...navInteraction} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ ...navInteraction.transition, opacity: { duration: reducedMotion ? motionTokens.reduced : motionTokens.navState, delay: open && !reducedMotion ? index * motionTokens.staggerSmall : 0 } }}
              to={link.href}
              aria-current={isActiveLink(link.href) ? (link.href.includes('#') ? 'location' : 'page') : undefined}
              onClick={event => navigateHomeAnchor(event, link.href)}
              style={{ ...navInteraction.style, '--menu-order': index } as CSSProperties}
            >
              <NavigationLabel active={isActiveLink(link.href)} className="mobile-menu-link-label">{bindShortWords(link.label)}</NavigationLabel>
            </MotionLink>
          ))
        )}
        <motion.a {...navInteraction} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ ...navInteraction.transition, opacity: { duration: reducedMotion ? motionTokens.reduced : motionTokens.navState, delay: open && !reducedMotion ? 2 * motionTokens.staggerSmall : 0 } }} href={profile.cv} aria-disabled={!profile.cv || undefined} target="_blank" rel="noreferrer" onClick={profile.cv ? () => trackEvent('resume_click', { location: 'mobile-menu' }) : undefined}><NavigationLabel className="mobile-menu-link-label">CV</NavigationLabel></motion.a>
      </motion.nav>
    </motion.header>
  )
}
