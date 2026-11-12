import { Link, useLocation } from 'react-router-dom'
import { StoryFooter } from './StoryChrome'
import { useLocale } from '../i18n/locale'

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
  if (variant === 'home') return <FooterBar variant="home" />
  return <StoryFooter location={variant} />
}
