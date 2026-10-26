import { Link, useLocation } from 'react-router-dom'

export function Footer() {
  const { pathname } = useLocation()
  return (
    <footer className="site-footer" data-reveal>
      <span className="site-footer-credit">
        <span>© 2026</span>
        <span className="site-footer-separator" aria-hidden="true">×</span>
        <span>Дизайнила и кодила Софья Стрельченко</span>
      </span>
      {pathname === '/copyright' ? <span className="site-footer-copyright">Авторские права</span> : <Link className="site-footer-copyright" to="/copyright">Авторские права</Link>}
    </footer>
  )
}
