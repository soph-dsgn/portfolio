import { Link, useLocation } from 'react-router-dom'

const footerContent = {
  year: '2026',
  author: 'Дизайнила и кодила Софья Стрельченко',
  copyright: 'Авторские права',
}

export function Footer({ variant = 'page' }: { variant?: 'page' | 'home' }) {
  const { pathname } = useLocation()
  return (
    <footer className={`site-footer site-footer--${variant}`} data-reveal>
      <span className="site-footer-credit">
        <span className="site-footer-mark"><span>© {footerContent.year}</span><span className="site-footer-separator" aria-hidden="true">×</span></span>
        <span className="site-footer-author">{footerContent.author}</span>
      </span>
      {pathname === '/copyright' ? <span className="site-footer-copyright">{footerContent.copyright}</span> : <Link className="site-footer-copyright" to="/copyright">{footerContent.copyright}</Link>}
    </footer>
  )
}
