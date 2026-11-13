import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/locale'
import { trackEvent } from '../lib/analytics'
import { publicAsset } from '../lib/publicAsset'
import type { ShowcaseCase } from '../data/showcaseCases'

const asset = (path: string) => publicAsset(path)

export function Check() {
  return <svg className="sc-check" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.2 12.5 4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

export function Pills({ rows }: { rows: ReactNode[][] }) {
  return <div className="sc-pills">{rows.map((row, index) => <div className="sc-pill-row" key={index}>
    {row.map((pill, pillIndex) => <span className="sc-pill" key={pillIndex}>{pill}</span>)}
  </div>)}</div>
}

/* ---------- Case card (1360 × 580): one component, cases described as data ---------- */

export function CaseCard({ item, page = false }: { item: ShowcaseCase; page?: boolean }) {
  const { t } = useLocale()
  const to = `/projects/${item.id}`
  const open = () => trackEvent('project_open', { project: item.id, location: 'home' })
  const art = (width: number) => asset(`/optimized/home/${item.art.stem}-${width}.webp`)
  // On the case page itself the card is the page header: an h1 without a self-link.
  const Heading = page ? 'h1' : 'h2'
  const Root = page ? 'header' : 'section'
  return <Root className={`sc-case${item.art.wide ? ' sc-case--wide-art' : ''}${page ? ' sc-case--page' : ''}`} aria-labelledby={`sc-${item.id}`}>
    <div className="sc-case-body">
      <Heading className="sc-case-title" id={`sc-${item.id}`}>{page ? t(item.title) : <Link to={to} onClick={open}>{t(item.homeTitle ?? item.title)}</Link>}</Heading>
      <ul className="sc-list">{(page ? item.points : item.homePoints ?? item.points).map(point => <li key={point}><Check />{t(point)}</li>)}</ul>
      {/* Metrics stay on the home card; inside the case the header lists role, platform and niche instead. */}
      {!page && <Pills rows={item.pills.map(row => row.map(pill => typeof pill === 'string'
        ? t(pill)
        : <>{t(pill.text)} <span>{t(pill.note)}</span></>))} />}
    </div>
    {page
      ? <div className="sc-case-art" aria-hidden="true"><img src={art(1280)} srcSet={`${art(640)} 640w, ${art(1280)} 1280w`}
        sizes="(max-width: 899px) 90vw, 600px" width={item.art.width} height={item.art.height} alt="" decoding="async" /></div>
      : <Link className="sc-case-art" to={to} tabIndex={-1} aria-hidden="true" onClick={open}>
        <img src={art(1280)} srcSet={`${art(640)} 640w, ${art(1280)} 1280w`} sizes="(max-width: 899px) 90vw, 600px"
          width={item.art.width} height={item.art.height} alt="" loading="lazy" decoding="async" />
      </Link>}
  </Root>
}

