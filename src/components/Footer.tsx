import { Link, useLocation } from 'react-router-dom'

export function Footer() {
  const { pathname } = useLocation()
  return (
    <footer className="site-footer" data-reveal>
      <span className="site-footer-credit">©2026</span>
      {pathname === '/copyright' ? <span className="site-footer-copyright">Авторские права</span> : <Link className="site-footer-copyright" to="/copyright">Авторские права</Link>}
    </footer>
  )
}
