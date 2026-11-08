import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowIcon } from './ArrowIcon'
import { ContactLinks } from './ContactLinks'
import { useLocale } from '../i18n/locale'
import { useMotionSystem } from '../lib/motion'

const footerContent = {
  year: '2026',
  author: 'Дизайнила Софья Стрельченко',
  copyright: 'Авторские права',
}

function FooterBar({ variant }: { variant: 'page' | 'home' }) {
  const { pathname } = useLocation()
  const { t } = useLocale()
  return (
    <footer className={`site-footer site-footer--${variant}`}>
      <span className="site-footer-credit">
        <span className="site-footer-mark"><span>© {footerContent.year}</span><span className="site-footer-separator" aria-hidden="true">×</span></span>
        <span className="site-footer-author">{t(footerContent.author)}</span>
      </span>
      {pathname === '/copyright' ? <span className="site-footer-copyright" aria-current="page">{t(footerContent.copyright)}</span> : <Link className="site-footer-copyright" to="/copyright">{t(footerContent.copyright)}</Link>}
    </footer>
  )
}

export function Footer({ variant = 'page' }: { variant?: 'page' | 'home' | 'case' }) {
  const { t } = useLocale()
  const { reduced, navInteraction } = useMotionSystem()

  if (variant !== 'case') return <FooterBar variant={variant} />

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  return <div className="case-footer-composition">
    <section className="case-contact-card" aria-labelledby="case-contact-title">
      <div className="case-contact-topline">
        <motion.button {...navInteraction} className="case-scroll-top" type="button" onClick={scrollToTop}>
          {t('Наверх')}<ArrowIcon direction="up" decorative />
        </motion.button>
      </div>
      <div className="case-contact-main">
        <h2 id="case-contact-title">{t('Обсудим ваш проект?')}</h2>
        <ContactLinks location="case-footer" variant="pill" className="case-contact-actions" />
      </div>
    </section>
    <FooterBar variant="page" />
  </div>
}
