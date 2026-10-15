import { useEntrance } from '../lib/useEntrance'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { aboutPresentation, aboutTools, education, experience, profile, toolLogos } from '../data/portfolio'
import type { Experience } from '../data/portfolio'
import { Icon } from './Icon'
import { SocialIconLinks, TelegramLink } from './ContactLinks'
import { MetaSeparatedText } from './MetaSeparatedText'
import { publicAsset } from '../lib/publicAsset'
import { Footer } from './Footer'
import { Typography } from './Typography'
import { motionTokens, useMotionSystem, useInterfaceReady } from '../lib/motion'
import { GreetingEyes } from './GreetingEyes'

function ToolsStrip() {
  return (
    <ul className="tools-strip" aria-label="Инструменты">
      {toolLogos.map((tool, index) => (
        <li
          className={`tool-tile tool-tile--${tool.id}`}
          key={tool.id}
          title={tool.label}
        >
          <span className="tool-logo-reveal" data-reveal="logo" data-reveal-order={index}>
            <img
              src={tool.src}
              alt={tool.label}
              width="32"
              height="32"
              loading="lazy"
              decoding="async"
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

function ResumeEntry({ item }: { item: Experience }) {
  const Heading = item.projects?.length ? 'h2' : 'h3'
  return (
    <Typography><li>
          <div className="resume-entry-intro">
            <span className={`company-logo${item.company === 'Contented' ? ' company-logo--contented' : ''}`} aria-hidden="true">
              {item.logo ? (
                <img src={item.logo} alt="" width="36" height="36" loading="lazy" decoding="async" />
              ) : null}
            </span>
            <div className="resume-entry-details">
              <Heading>{item.role}</Heading>
              <p className="resume-entry-company">{item.company}</p>
              <p className="resume-entry-period">{item.period}</p>
              {item.summary ? <p className="resume-entry-summary">{item.summary}</p> : null}
            </div>
            {item.certificateUrl ? (
              <a className="certificate-link" href={item.certificateUrl} target="_blank" rel="noreferrer"
                aria-label={`Посмотреть сертификат ${item.company}`} title="Посмотреть сертификат">
                <span className="certificate-link-visual"><Icon name="external" /></span>
              </a>
            ) : null}
          </div>
          {item.projects?.length ? (
              <div className="resume-projects">
              {item.projects.map((project, index) => (
                <article className="resume-project" key={project.title}>
                  <h3 className="resume-project-title">{index + 1}. {project.title.replace(/^\d+\.\s*/, '')}</h3>
                  <h4 className="resume-project-topic">Результат</h4>
                  <ul className="star-list" role="list">{project.results.map((result) => <li key={result}>{result}</li>)}</ul>
                  <h4 className="resume-project-topic">Проблема</h4>
                  <p>{project.problem}</p>
                  <h4 className="resume-project-topic">Решение</h4>
                  <p>{project.solution}</p>
                </article>
              ))}
              </div>
          ) : null}
    </li></Typography>
  )
}

function ResumeEntries({ items }: { items: Experience[] }) {
  return (
    <ol className="resume-entries">
      {items.map((item) => <ResumeEntry key={item.company} item={item} />)}
    </ol>
  )
}

export function ProfileHero() {
  const { variants, reduced, adaptive, mobileEntrance, mobileGroup } = useMotionSystem()
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const headlineVisible = useInView(headlineRef, { amount: .35 })
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  const uiReady = useInterfaceReady()
  const breathe = !reduced && uiReady && headlineVisible && documentVisible
  const breath = {
    initial: false as const,
    animate: { transform: breathe
      ? ['scaleX(1)', `scaleX(${motionTokens.signature.type.maximum})`, `scaleX(${motionTokens.signature.type.minimum})`, `scaleX(${motionTokens.signature.type.returnScale})`, 'scaleX(1)']
      : 'scaleX(1)', opacity: breathe ? motionTokens.signature.type.opacity : 1 },
    transition: breathe
      ? { duration: motionTokens.signature.type.duration, ease: motionTokens.easeFloat, repeat: Infinity }
      : { duration: reduced ? 0 : motionTokens.micro },
    style: { transformOrigin: 'left center' },
  }
  return <motion.section initial="hidden" animate={uiReady ? 'visible' : 'hidden'} variants={adaptive ? mobileGroup() : undefined} className="profile-hero" data-canvas-panel aria-labelledby="hero-title">
    <motion.div className="hero-copy" initial={adaptive ? undefined : 'hidden'} animate={adaptive ? undefined : uiReady ? 'visible' : 'hidden'}>
      <motion.div className="hero-identity" variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.greeting) : variants('fade', .04)}>
        <p className="hero-greeting"><span>Привет</span>{' '}<GreetingEyes />{' '}<span>я — Соня</span></p>
      </motion.div>
      <motion.h1 ref={headlineRef} id="hero-title" className="profile-role">
        <motion.span className="hero-headline-line" variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.title) : variants('left', 0.120)}>UX/UI &amp; Product Designer</motion.span>{' '}
        <motion.span className="hero-headline-line hero-headline-secondary" variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.secondary) : variants('left', 0.185)}><motion.span className="hero-type-breath" data-breathing={breathe ? 'active' : 'paused'} {...breath}><Typography>Проектирую B2B/B2C-продукты:</Typography></motion.span></motion.span>{' '}
        <motion.span className="hero-headline-line hero-headline-secondary" variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.secondary) : variants('left', 0.250)}><motion.span className="hero-type-breath" data-breathing={breathe ? 'active' : 'paused'} {...breath}><Typography>от первой логики до интерфейса, который можно отдавать в разработку</Typography></motion.span></motion.span>
      </motion.h1>
      <motion.div className="hero-links" variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.actions) : variants('soft', .34)}><SocialIconLinks location="hero" /></motion.div>
      <motion.p className="hero-location" variants={adaptive ? mobileEntrance(0) : variants('fade', .4)}><MetaSeparatedText value={profile.location} /></motion.p>
    </motion.div>
    <div className="hero-visual">
      <motion.div className="profile-avatar" initial={adaptive ? undefined : 'hidden'} animate={adaptive ? undefined : uiReady ? 'visible' : 'hidden'} variants={adaptive ? mobileEntrance(motionTokens.mobile.hero.photoY, motionTokens.mobile.hero.photoScale) : variants('scale', .18)}>
        <img src={publicAsset('optimized/home/avatar-1200.webp')} srcSet={`${publicAsset('optimized/home/avatar-640.webp')} 640w, ${publicAsset('optimized/home/avatar-1200.webp')} 1200w`} sizes="(min-width: 1101px) 30.5vw, (min-width: 761px) 45vw, calc(100vw - 32px)" alt={`Фото ${profile.name}`} width="1200" height="1500" loading="eager" decoding="async" fetchPriority="high" />
      </motion.div>
    </div>
  </motion.section>
}

export function ProfileAbout() {
  const { variants, hoverLift, metricGroupVariants, metricItemVariants, metricVariants, metricCaptionVariants, reduced, adaptive, mobileEntrance, mobileGroup } = useMotionSystem()
  const aboutRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLElement>(null)
  const introVisible = useEntrance(introRef)
  const metricsVisible = useEntrance(metricsRef, .1, 'canvas-visible')
  const toolsVisible = useEntrance(toolsRef)
  return <Typography><motion.section ref={aboutRef} className="profile-about" id="about" data-canvas-panel aria-label="Обо мне"
    initial="hidden">
    <motion.div ref={introRef} className="about-intro" initial="hidden" animate={introVisible ? 'visible' : 'hidden'} variants={mobileGroup()}>
    <motion.h2 id="about-title" className="about-statement" variants={adaptive ? mobileEntrance(motionTokens.mobile.about.statement) : variants('fade')}>
      {aboutPresentation.statement} <span>{aboutPresentation.emphasis}</span>
    </motion.h2>
    <motion.p className="about-background" variants={adaptive ? mobileEntrance(motionTokens.mobile.about.background) : variants('soft', .08)}>{aboutPresentation.background}</motion.p>
    </motion.div>
    <motion.div ref={metricsRef} className="about-principles" initial={reduced ? false : 'hidden'}
      animate={metricsVisible ? 'visible' : 'hidden'}
      variants={metricGroupVariants} data-metrics-state={metricsVisible ? 'visible' : 'pending'}>
      {aboutPresentation.principles.map((principle) => <motion.div variants={metricItemVariants} className="about-principle" key={principle.title}>
        <motion.h3 style={{ transformOrigin: 'left center' }} variants={metricVariants()}>{principle.title}</motion.h3>
        <motion.p variants={metricCaptionVariants()}>{principle.description}</motion.p>
      </motion.div>)}
    </motion.div>
    <motion.footer ref={toolsRef} className="about-bottom" initial="hidden" animate={toolsVisible ? 'visible' : 'hidden'} variants={adaptive ? mobileGroup(motionTokens.mobile.tools.stagger, motionTokens.mobile.toolsDelay) : variants('fade', .12)}>
      <ul className="about-tool-chips" aria-label="Инструменты">
        {aboutTools.map(tool => <motion.li key={tool.id} {...hoverLift} variants={adaptive ? mobileEntrance(motionTokens.mobile.tools.y) : undefined}>{tool.label}</motion.li>)}
      </ul>
    </motion.footer>
  </motion.section></Typography>
}

export function ExperienceContent() {
  return <Typography><div className="profile-details">
    <section className="experience" id="experience" aria-labelledby="experience-title">
      <div className="section-heading"><h1 id="experience-title" data-reveal="text">Опыт работы</h1></div>
      <ResumeEntries items={experience} />
    </section>
    <section className="education-section" id="education" aria-labelledby="education-title">
      <div className="section-heading"><h2 id="education-title" data-reveal="text">Образование<br />и курсы</h2></div>
      <ResumeEntries items={education} />
    </section>
    <section className="tools-section" aria-labelledby="tools-title">
      <h2 id="tools-title" data-reveal="text">Инструменты</h2>
      <ToolsStrip />
    </section>
  </div></Typography>
}

export function ProfileContact({ homepage = false }: { homepage?: boolean }) {
  const { variants, reduced, adaptive, hover, mobileEntrance, mobileGroup } = useMotionSystem()
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: .08 }} variants={adaptive ? mobileGroup() : undefined} className="contacts-section" id="contacts" data-canvas-panel aria-labelledby="contacts-title">
      <motion.div className="contact-copy">
        <motion.h2 id="contacts-title" className={homepage ? 'contact-headline--intro' : undefined} variants={adaptive ? mobileEntrance(motionTokens.mobile.contact.headline) : variants('fade')}><Typography>{homepage ? 'Если кажется, что я подхожу вашей команде — давайте знакомиться' : 'Будем на связи!'}</Typography></motion.h2>
        <motion.div className="contact-actions" variants={adaptive ? mobileEntrance(motionTokens.mobile.contact.actions) : variants('soft', .12)}><TelegramLink location="contacts" label="Написать мне" showIcon={false} /><SocialIconLinks location="contacts" first="hh" /></motion.div>
      </motion.div>
      <motion.div className="contact-signature" variants={adaptive ? mobileEntrance(motionTokens.mobile.contact.signature, motionTokens.mobile.contact.scale) : variants('left', .22)}>
        <span className="sr-only">@wsslxq</span>
        <motion.span aria-hidden="true" initial="rest" whileHover={hover && !adaptive && !reduced ? 'spread' : undefined}>
          {Array.from('@wsslxq').map((character, index) => <motion.span key={index} style={{ display: 'inline-block' }}
            variants={{ rest: { transform: 'translateX(0px)' }, spread: { transform: `translateX(${(index - 3) * .8}px)` } }}
            transition={motionTokens.interaction}>{character}</motion.span>)}
        </motion.span>
      </motion.div>
      <motion.img variants={variants('scale', .18)} className="contact-portrait" src={publicAsset('optimized/home/contact-portrait-960.webp')} srcSet={`${publicAsset('optimized/home/contact-portrait-480.webp')} 480w, ${publicAsset('optimized/home/contact-portrait-960.webp')} 960w`} sizes="(min-width: 1101px) 260px, (min-width: 761px) 180px, 100px" alt="Фото Софьи Стрельченко" width="960" height="1200" loading="lazy" decoding="async" />
      <Footer />
    </motion.section>
  )
}
