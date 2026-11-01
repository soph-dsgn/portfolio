import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import type { PointerEvent } from 'react'
import { CaseCursor } from './CaseCursor'
import { Typography } from './Typography'
import { projects, profile, type Project } from '../data/portfolio'
import { publicAsset } from '../lib/publicAsset'
import { trackEvent } from '../lib/analytics'
import { useLocale } from '../i18n/locale'
import { useMotionSystem } from '../lib/motion'
import { useArtworkParallax } from '../lib/useArtworkParallax'
import { captureHomeScroll } from '../lib/pageScroll'
import { rememberHomeProject, rememberHomeProjectView } from '../lib/HomeMotionContext'

const toolCloud = [
  ['Figma', 'figma'], ['Figma Motion', 'figma-motion'], ['FigJam', 'figjam'],
  ['ProtoPie', 'protopie'], ['Principle', 'principle'], ['Miro', 'miro'],
  ['Яндекс Метрика', 'metrica'], ['Google Analytics', 'analytics'], ['Notion', 'notion'],
  ['Jira', 'jira'], ['Confluence', 'confluence'], ['ChatGPT', 'chatgpt'],
  ['Codex', 'codex'], ['Claude', 'claude'], ['Cursor', 'cursor'],
] as const

const homeProjectPresentation: Record<string, { title: string; image: string }> = {
  concepts: { title: 'UI-концепты', image: 'figma/home/concepts.png' },
  'partner-portal': { title: 'Partner Portal: −20% обращений в поддержку', image: 'figma/home/partner-portal.png' },
  skywallet: { title: 'SkyWallet: риск ошибок −30%', image: 'figma/home/skywallet.png' },
}

function AddIcon() {
  return <img className="home-pill-icon" src={publicAsset('figma/home/nav-add.svg')} alt="" width="24" height="24" />
}

function HomeAction({ children, href, event, disabled = false }: {
  children: string; href?: string; event?: 'telegram_click' | 'resume_click' | 'linkedin_click' | 'email_click'; disabled?: boolean
}) {
  const { navInteraction } = useMotionSystem()
  const props = {
    ...navInteraction,
    className: 'home-pill',
    'aria-disabled': disabled || undefined,
    onClick: event && !disabled ? () => {
      if (event === 'telegram_click') trackEvent('contact_click', { location: 'home' })
      trackEvent(event, { location: 'home' })
    } : undefined,
  }
  const content = <><Typography>{children}</Typography><AddIcon /></>
  if (!href || disabled) return <motion.span {...props}>{content}</motion.span>
  return <motion.a {...props} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}>{content}</motion.a>
}

function Portrait({ kind }: { kind: 'hero' | 'contact' }) {
  return <motion.span className={`home-inline-portrait home-inline-portrait--${kind}`} initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 1, rotate: '5.09deg' }} transition={{ duration: .5 }}>
    <img src={publicAsset(`figma/home/${kind}-portrait.png`)} alt="" width="100" height="109" />
  </motion.span>
}

export function HomeHero() {
  const { locale, setLocale } = useLocale()
  return <Typography><motion.section className="home-figma-card home-hero-card" data-canvas-panel aria-labelledby="hero-title"
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
    <div className="home-card-canvas">
    <div className="home-hero-main">
      <div className="home-greeting"><span>Привет</span><Portrait kind="hero" /><span>я — Соня!</span></div>
      <h1 id="hero-title"><span>Продуктовый &amp; UX/UI дизайнер</span><strong>с опытом B2B/B2C, запуском</strong><strong>и развитием цифровых продуктов</strong></h1>
      <nav className="home-pill-row" aria-label="Контакты">
        <HomeAction href={profile.telegram} event="telegram_click">Telegram</HomeAction>
        <HomeAction href={profile.cv} event="resume_click" disabled={!profile.cv}>CV</HomeAction>
        <HomeAction href={profile.linkedin} event="linkedin_click">Linkedin</HomeAction>
        <HomeAction href={profile.email} event="email_click">Mail</HomeAction>
      </nav>
    </div>
    <div className="home-card-footer">
      <p><span>Москва</span><b aria-hidden="true">×</b><span>GMT +3</span></p>
      <div className="home-locale" role="group" aria-label="Выбор языка">
        <button type="button" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}>Ru</button><b aria-hidden="true">×</b><button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>Eng</button>
      </div>
    </div>
    </div>
  </motion.section></Typography>
}

export function HomeAbout() {
  return <Typography><motion.section id="about" className="home-figma-card home-about-card" data-canvas-panel aria-labelledby="about-title"
    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .5 }}>
    <div className="home-card-canvas">
    <div className="home-about-copy">
      <h2 id="about-title">3+ года в цифровых продуктах</h2>
      <p>В <span className="home-company"><img src={publicAsset('figma/home/yukki.svg')} alt="" />Юкки</span>, <span className="home-company"><img src={publicAsset('figma/home/make.svg')} alt="" />Make Difference</span> и <span className="home-company"><img src={publicAsset('figma/home/sky.svg')} alt="" />SkyCapital</span><br />проектировала интерфейсы, разбиралась<br />в сложных сценариях и развивала продукты</p>
      <p>Училась продуктовому дизайну в <span className="home-company"><img src={publicAsset('figma/home/formfactor.svg')} alt="" />FormFactor</span><br />и UX/UI-дизайну в <span className="home-company"><img src={publicAsset('figma/home/contented.svg')} alt="" />Contented</span></p>
    </div>
    <ul className="home-tool-cloud" aria-label="Инструменты">
      {toolCloud.map(([label, id]) => <li className={`home-tool home-tool--${id}`} data-ai={['chatgpt', 'codex', 'claude', 'cursor'].includes(id) || undefined} key={id}>{label}</li>)}
    </ul>
    </div>
  </motion.section></Typography>
}

export function HomeProjectCard({ project }: { project: Project }) {
  const presentation = homeProjectPresentation[project.id]
  const location = useLocation()
  const parallax = useArtworkParallax(true)
  if (!presentation) return null
  const onLeave = () => parallax.reset()
  const onMove = (event: PointerEvent<HTMLAnchorElement>) => parallax.onPointerMove(event)
  return <article className={`home-figma-card home-project-card home-project-card--${project.id}`} data-canvas-panel data-project={project.id}>
    <div className="home-card-canvas">
    <Link className="home-project-link" to={`/projects/${project.id}`} state={{ homeEntryKey: location.key, portal: true }}
      aria-labelledby={`${project.id}-title`} onPointerMove={onMove} onPointerLeave={onLeave} onMouseLeave={onLeave}
      onClick={event => {
        captureHomeScroll(location.key)
        rememberHomeProject(location.key, project.id)
        rememberHomeProjectView(location.key, event.currentTarget)
        trackEvent('project_open', { project: project.id, location: 'home' })
      }}>
      <CaseCursor enabled>
        <h2 id={`${project.id}-title`}><Typography>{presentation.title}</Typography></h2>
        <motion.img className="home-project-art" style={parallax.style} src={publicAsset(presentation.image)} alt="" draggable={false} loading={project.id === 'concepts' ? 'eager' : 'lazy'} decoding="async" />
      </CaseCursor>
    </Link>
    </div>
  </article>
}

export function HomeWork() {
  const featured = ['concepts', 'partner-portal', 'skywallet'].map(id => projects.find(project => project.id === id)).filter((project): project is Project => Boolean(project))
  return <section id="work" aria-label="Избранные работы"><h2 className="sr-only">Избранные работы</h2><div className="project-list">
    <HomeProjectCard project={featured[0]} />
    <HomeAbout />
    {featured.slice(1).map(project => <HomeProjectCard project={project} key={project.id} />)}
  </div></section>
}

export function HomeContact() {
  return <Typography><motion.section id="contacts" className="home-figma-card home-contact-card" data-canvas-panel aria-labelledby="contacts-title"
    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .5 }}>
    <div className="home-card-canvas">
    <div className="home-contact-main">
      <p className="home-availability"><img src={publicAsset('figma/home/status.svg')} alt="" width="16" height="16" />Открыта к предложениям</p>
      <Portrait kind="contact" />
      <h2 id="contacts-title"><span>Это конец сайта, но,</span><strong>может, начало</strong><strong>чего-то классного?</strong></h2>
      <nav className="home-pill-row" aria-label="Контакты">
        <HomeAction href={profile.telegram} event="telegram_click">Telegram</HomeAction>
        <HomeAction href={profile.cv} event="resume_click" disabled={!profile.cv}>CV</HomeAction>
        <HomeAction href={profile.linkedin} event="linkedin_click">Linkedin</HomeAction>
        <HomeAction href={profile.email} event="email_click">Mail</HomeAction>
      </nav>
    </div>
    <footer className="home-card-footer home-contact-footer">
      <p><span>@ 2026, дизайнила Софья Стрельченко</span></p>
      <Link to="/copyright">Авторские права</Link>
    </footer>
    </div>
  </motion.section></Typography>
}
