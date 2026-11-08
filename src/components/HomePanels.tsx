import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import type { PointerEvent } from 'react'
import { CaseCursor } from './CaseCursor'
import { Typography } from './Typography'
import { projects, type Project } from '../data/portfolio'
import { publicAsset } from '../lib/publicAsset'
import { trackEvent } from '../lib/analytics'
import { useLocale } from '../i18n/locale'
import { useMotionSystem } from '../lib/motion'
import { useArtworkParallax } from '../lib/useArtworkParallax'
import { captureHomeScroll } from '../lib/pageScroll'
import { rememberHomeProject, rememberHomeProjectView } from '../lib/HomeMotionContext'
import { InteractiveToolCloud } from './InteractiveToolCloud'
import { Footer } from './Footer'
import { ContactLinks } from './ContactLinks'

const homeProjectPresentation: Record<string, { title: string; image: string; srcSet?: string; optimized?: string; width: number; height: number; parallax: number }> = {
  concepts: {
    title: 'UI-концепты',
    image: 'optimized/concepts/cover-1600.png?v=90356d747719',
    width: 1600,
    height: 1177,
    parallax: 6,
  },
  'partner-portal': {
    title: 'Partner Portal: −20% обращений в поддержку',
    image: 'cases/partner-portal/Cover.png?v=20261109a',
    srcSet: `${publicAsset('optimized/home/partner-portal-960.jpg')}?v=20261109a 960w, ${publicAsset('optimized/home/partner-portal-1920.jpg')}?v=20261109a 1920w`,
    width: 6872,
    height: 5504,
    parallax: 8,
  },
  skywallet: {
    title: 'SkyWallet: риск ошибок −30%',
    image: 'cases/skywallet/Cover.png?v=27d645c8f479',
    srcSet: `${publicAsset('optimized/home/skywallet-cover-640.jpg')}?v=27d645c8f479 640w, ${publicAsset('optimized/home/skywallet-cover-1280.jpg')}?v=27d645c8f479 1280w`,
    width: 3133,
    height: 3210,
    parallax: 5,
  },
}

function Portrait({ kind }: { kind: 'hero' | 'contact' }) {
  const optimized = kind === 'hero' ? 'hero-portrait' : 'contact-portrait-inline'
  const original = `figma/home/${kind}-portrait.png`
  return <span className={`home-inline-portrait home-inline-portrait--${kind}`}>
    <picture>
      <source type="image/avif" srcSet={`${publicAsset(`optimized/home/${optimized}-160.avif`)} 160w, ${publicAsset(`optimized/home/${optimized}-320.avif`)} 320w`} sizes="(min-width: 1101px) 116px, (min-width: 761px) 90px, 70px" />
      <source type="image/webp" srcSet={`${publicAsset(`optimized/home/${optimized}-160.webp`)} 160w, ${publicAsset(`optimized/home/${optimized}-320.webp`)} 320w`} sizes="(min-width: 1101px) 116px, (min-width: 761px) 90px, 70px" />
      <img src={publicAsset(original)} alt="" width={kind === 'hero' ? 3024 : 1388} height={kind === 'hero' ? 3582 : 1133}
        loading={kind === 'hero' ? 'eager' : 'lazy'} decoding="async" fetchPriority={kind === 'hero' ? 'high' : 'auto'} data-lcp-image={kind === 'hero' || undefined} />
    </picture>
  </span>
}

export function HomeHero() {
  const { locale, setLocale } = useLocale()
  return <Typography><motion.section className="home-figma-card home-hero-card" data-canvas-panel aria-labelledby="hero-title"
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
    <div className="home-card-canvas">
    <div className="home-hero-main">
      <div className="home-greeting"><span>Привет</span><Portrait kind="hero" /><span>я — Соня!</span></div>
      <div className="home-card-message">
        <h1 id="hero-title"><span>Продуктовый &amp; UX/UI дизайнер</span><strong>с опытом B2B/B2C, запуском</strong><strong>и развитием цифровых продуктов</strong></h1>
        <ContactLinks location="home" variant="pill" className="home-pill-row" />
      </div>
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
      <p>В <span className="home-company"><img src={publicAsset('figma/home/yukki.svg')} alt="" />Юкки</span>, <span className="home-company"><img src={publicAsset('figma/home/make.svg')} alt="" />Make Difference</span> и <span className="home-company"><img src={publicAsset('figma/home/sky.svg')} alt="" />SkyCapital</span><br /> проектировала интерфейсы, разбиралась<br /> в сложных сценариях и развивала продукты</p>
      <p>Училась продуктовому дизайну в <span className="home-company"><img src={publicAsset('figma/home/formfactor.svg')} alt="" />FormFactor</span><br /> и UX/UI-дизайну в <span className="home-company"><img src={publicAsset('figma/home/contented.svg')} alt="" />Contented</span></p>
    </div>
    <InteractiveToolCloud />
    </div>
  </motion.section></Typography>
}

export function HomeProjectCard({ project }: { project: Project }) {
  const presentation = homeProjectPresentation[project.id]
  const location = useLocation()
  const { hover, reduced } = useMotionSystem()
  const parallax = useArtworkParallax(hover && !reduced, presentation?.parallax)
  if (!presentation) return null
  const onLeave = () => parallax.reset()
  const onMove = (event: PointerEvent<HTMLAnchorElement>) => parallax.onPointerMove(event)
  return <article id={project.id} className={`home-figma-card home-project-card home-project-card--${project.id}`} data-canvas-panel data-project={project.id}>
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
        <picture>
          {presentation.optimized && <source type="image/avif" srcSet={`${publicAsset(`optimized/home/${presentation.optimized}-640.avif`)} 640w, ${publicAsset(`optimized/home/${presentation.optimized}-1280.avif`)} 1280w`} sizes="(min-width: 1101px) 44vw, (min-width: 761px) 74vw, 76vw" />}
          {presentation.optimized && <source type="image/webp" srcSet={`${publicAsset(`optimized/home/${presentation.optimized}-640.webp`)} 640w, ${publicAsset(`optimized/home/${presentation.optimized}-1280.webp`)} 1280w`} sizes="(min-width: 1101px) 44vw, (min-width: 761px) 74vw, 76vw" />}
          <motion.img className="home-project-art" style={parallax.style} src={publicAsset(presentation.image)} srcSet={presentation.srcSet} sizes={presentation.srcSet ? '(min-width: 1101px) 28vw, (min-width: 761px) 44vw, 46vw' : undefined} alt="" width={presentation.width} height={presentation.height}
            draggable={false} loading="lazy" decoding="async" fetchPriority="low" />
        </picture>
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
      <div className="home-contact-intro">
        <p className="home-availability"><img src={publicAsset('figma/home/status.svg')} alt="" width="16" height="16" />Открыта к предложениям</p>
        <Portrait kind="contact" />
      </div>
      <div className="home-card-message">
        <h2 id="contacts-title"><span>Это конец сайта, но,</span><strong>может, начало</strong><strong>чего-то классного?</strong></h2>
        <ContactLinks location="home" variant="pill" className="home-pill-row" />
      </div>
    </div>
    <Footer variant="home" />
    </div>
  </motion.section></Typography>
}
