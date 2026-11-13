import { createContext, useContext, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useLocale } from '../i18n/locale'
import { useUISound } from '../lib/soundContext'

/* One sticker system: flat two-tone glyphs on a shared palette, one viewBox unit = one unit of the
   1360 × 833 hero zone, the same 10-unit white die-cut on every shape.
   The cut line and the lift shadow are drawn in SVG, so nothing runs CSS filters; each sticker is its own
   compositor layer, so dragging only moves a layer instead of repainting the hero.
   Peeling: a corner folds back along a diagonal; the flap is the sticker's own silhouette, clipped to the
   corner and mirrored over the fold, so every shape peels like itself. */

type Corner = 'br' | 'bl' | 'tr' | 'tl'
/** 0 = flat, .35 = hover hint, 1 = lifted. Provided per sticker, read by its artwork. */
const PeelContext = createContext<MotionValue<number> | null>(null)

const CUT = 10
const PAD = CUT / 2 + 2
/** Extra room on the right and bottom for the lift shadow. */
const DROP = 12
/** Displayed width (zone units) of a sticker whose artwork is `width` units wide. */
const outerWidth = (width: number) => width + PAD * 2 + DROP

const ink = '#080808', blue = '#2973ff', yellow = '#ffd02f', orange = '#ff7a3d', coral = '#ff5c7a'
/** Every sticker shares one drawing rule: flat fills from this palette, a 5-unit ink outline, round joins. */
const line = { stroke: ink, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const font = "'Manrope Variable', Manrope, sans-serif"

/** `round`: corner radius at the peel corner, so the fold starts where the sticker does.
    `scale`: draws artwork authored at another size (the Figma mark) on the shared unit grid. */
function Art({ box: [width, height], edge, peel = 'br', peelSize = 0.26, round = 0, scale = 1, children }: {
  box: [number, number]; edge: ReactNode; peel?: Corner; peelSize?: number; round?: number; scale?: number; children: ReactNode
}) {
  const progress = useContext(PeelContext)
  const id = useId().replace(/:/g, '')
  const hole = useRef<SVGPolygonElement>(null), clip = useRef<SVGPolygonElement>(null)
  const flap = useRef<SVGGElement>(null), shade = useRef<SVGGElement>(null), gradient = useRef<SVGLinearGradientElement>(null)
  const view = [-PAD, -PAD, width + PAD * 2 + DROP, height + PAD * 2 + DROP]
  const shape = (strokeWidth: number) => scale === 1 ? edge : <g transform={`scale(${scale})`} style={{ strokeWidth: strokeWidth / scale }}>{edge}</g>

  useEffect(() => {
    if (!progress) return
    // Fold geometry: C is the outer corner of the die-cut, A and B sit on the two edges, AB is the fold line.
    const sx = peel.endsWith('r') ? 1 : -1, sy = peel.startsWith('b') ? 1 : -1
    const cx = sx > 0 ? width + PAD : -PAD, cy = sy > 0 ? height + PAD : -PAD
    const inset = PAD * 2 + round * 0.6, reach = Math.min(width, height) * peelSize
    const k = -sx * sy
    const draw = (value: number) => {
      const length = value > 0.01 ? inset + value * reach : 0
      const visible = length > 0.5
      const ax = cx - sx * length, ay = cy, bx = cx, by = cy - sy * length
      const points = visible ? `${cx},${cy} ${ax},${ay} ${bx},${by}` : ''
      hole.current?.setAttribute('points', points)
      clip.current?.setAttribute('points', points)
      // Mirror across AB: x' = k·y + e, y' = k·x + f.
      const matrix = `matrix(0 ${k} ${k} 0 ${ax - k * ay} ${ay - k * ax})`
      flap.current?.setAttribute('transform', matrix)
      flap.current?.setAttribute('visibility', visible ? 'visible' : 'hidden')
      shade.current?.setAttribute('transform', `translate(${-sx * length * 0.07} ${-sy * length * 0.07}) ${matrix}`)
      shade.current?.setAttribute('visibility', visible ? 'visible' : 'hidden')
      const g = gradient.current
      if (g) { g.setAttribute('x1', String((ax + bx) / 2)); g.setAttribute('y1', String((ay + by) / 2)); g.setAttribute('x2', String(cx)); g.setAttribute('y2', String(cy)) }
    }
    draw(progress.get())
    return progress.on('change', draw)
  }, [progress, peel, peelSize, round, width, height])

  return <svg viewBox={view.join(' ')} aria-hidden="true">
    <defs>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={view[0]} y={view[1]} width={view[2]} height={view[3]}>
        <rect x={view[0]} y={view[1]} width={view[2]} height={view[3]} fill="#fff" />
        <polygon ref={hole} fill="#000" />
      </mask>
      <clipPath id={`${id}-c`}><polygon ref={clip} /></clipPath>
      <linearGradient id={`${id}-g`} ref={gradient} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#d6d6d9" /><stop offset=".45" stopColor="#f1f1f2" /><stop offset="1" stopColor="#fff" />
      </linearGradient>
    </defs>
    <g className="sc-sticker-drop" transform="translate(4 9)" style={{ strokeWidth: CUT }}>{shape(CUT)}</g>
    <g mask={`url(#${id}-m)`}>
      <g className="sc-sticker-rim" style={{ strokeWidth: CUT + 2 }}>{shape(CUT + 2)}</g>
      <g className="sc-sticker-cut" style={{ strokeWidth: CUT }}>{shape(CUT)}</g>
      {scale === 1 ? children : <g transform={`scale(${scale})`}>{children}</g>}
    </g>
    <g ref={shade} visibility="hidden"><g clipPath={`url(#${id}-c)`}>
      <g className="sc-sticker-flap" style={{ fill: 'rgba(8, 8, 8, .16)', stroke: 'rgba(8, 8, 8, .16)', strokeWidth: CUT }}>{shape(CUT)}</g>
    </g></g>
    <g ref={flap} visibility="hidden"><g clipPath={`url(#${id}-c)`}>
      <g className="sc-sticker-flap" style={{ fill: `url(#${id}-g)`, stroke: `url(#${id}-g)`, strokeWidth: CUT }}>{shape(CUT)}</g>
    </g></g>
  </svg>
}

/** UX in one line: the name tag. */
const NameTag = () => <Art box={[200, 124]} round={18} edge={<rect width="200" height="124" rx="18" />}>
  <rect x="2.5" y="2.5" width="195" height="119" rx="16" fill={blue} {...line} />
  <rect x="12" y="42" width="176" height="70" rx="9" fill="#fff" {...line} />
  <text x="18" y="31" fill="#fff" fontFamily={font} fontWeight="800" fontSize="18" letterSpacing=".6">HELLO, I’M</text>
  <text x="100" y="86" textAnchor="middle" fill={ink} fontFamily={font} fontWeight="700" fontSize="23">User Friendly</text>
</Art>

/** The word on every team board: heavy slanted letters with an ink extrusion. */
const sprintText = (props: Record<string, unknown>) => <text x="10" y="64" fontFamily={font} fontWeight="800" fontSize="58"
  textLength="196" lengthAdjust="spacingAndGlyphs" transform="skewX(-12) translate(14 0)" {...props}>SPRINT</text>
const Sprint = () => <Art box={[222, 84]} peelSize={0.3} edge={<g>{[0, 4, 8].map(d => <g key={d} transform={`translate(${d} ${d})`}>{sprintText({})}</g>)}</g>}>
  {[8, 6, 4, 2].map(d => <g key={d} transform={`translate(${d} ${d})`}>{sprintText({ fill: ink, stroke: ink, strokeWidth: 5, strokeLinejoin: 'round' })}</g>)}
  {sprintText({ fill: orange, stroke: ink, strokeWidth: 3.5, strokeLinejoin: 'round', paintOrder: 'stroke' })}
</Art>

/** Command key in a heart: the shortcut that runs the whole working day. */
const heart = 'M52 93C22 73 3 55 3 32 3 15 15 3 30 3c10 0 18 5 22 13C56 8 64 3 74 3c15 0 27 12 27 29 0 23-19 41-49 61Z'
const CommandHeart = () => <Art box={[104, 96]} peel="bl" round={24} peelSize={0.22} edge={<path d={heart} />}>
  <path d={heart} fill={coral} {...line} />
  <path transform="translate(31 22) scale(1.75)" d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
    fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</Art>

/** A pair of eyes watching the cursor. */
const Eyes = () => <Art box={[124, 80]} round={30} peelSize={0.3} edge={<><rect width="60" height="80" rx="30" /><rect x="64" width="60" height="80" rx="30" /></>}>
  <rect x="2.5" y="2.5" width="55" height="75" rx="27.5" fill="#fff" {...line} />
  <rect x="66.5" y="2.5" width="55" height="75" rx="27.5" fill="#fff" {...line} />
  <circle cx="38" cy="44" r="13" fill={ink} />
  <circle cx="102" cy="44" r="13" fill={ink} />
  <circle cx="42" cy="39" r="3.5" fill="#fff" />
  <circle cx="106" cy="39" r="3.5" fill="#fff" />
</Art>

/** Multiplayer cursor with a name tag, as in a shared Figma file. */
const arrow = 'M8 6 60 26 36 34 27 60Z'
function Cursor() {
  const { t } = useLocale()
  return <Art box={[124, 98]} round={18} edge={<><path d={arrow} strokeLinejoin="round" /><rect x="44" y="60" width="80" height="38" rx="19" /></>}>
    <path d={arrow} fill={ink} {...line} />
    <rect x="46.5" y="62.5" width="75" height="33" rx="16.5" fill={blue} {...line} />
    <text x="84" y="85" textAnchor="middle" fill="#fff" fontFamily={font} fontWeight="700" fontSize="17">{t('Софа')}</text>
  </Art>
}

/** Mouse: two buttons and the scroll wheel. */
const Mouse = () => <Art box={[72, 108]} round={34} peelSize={0.3} edge={<rect width="72" height="108" rx="34" />}>
  <rect x="2.5" y="2.5" width="67" height="103" rx="31.5" fill={yellow} {...line} />
  <path d="M36 4v34M4 40h64" fill="none" {...line} />
  <rect x="30" y="14" width="12" height="20" rx="6" fill={ink} />
</Art>

/** Laptop lid, closed over a sticker of its own. */
const Laptop = () => <Art box={[164, 108]} peel="tr" round={14} peelSize={0.22} edge={<><rect x="12" width="152" height="94" rx="14" /><rect y="86" width="164" height="22" rx="11" /></>}>
  <rect x="2.5" y="88.5" width="159" height="17" rx="8.5" fill="#fff" {...line} />
  <rect x="14.5" y="2.5" width="147" height="89" rx="12" fill={ink} {...line} />
  <path transform="translate(88 47)" d="M0-17 4.5-4.5 17 0 4.5 4.5 0 17-4.5 4.5-17 0-4.5-4.5Z" fill="#fff" />
</Art>

/** `box`: desktop [left, top] and artwork width on the 1360 × 833 zone; `mobile`: [left %, top % of the portrait height]. */
type StickerSpec = { id: string; label: string; art: ReactNode; width: number; box: [number, number]; mobile: [number, number]; rotate: number }

const stickers: StickerSpec[] = [
  { id: 'name', label: 'Hello, I’m User Friendly', art: <NameTag />, width: 200, box: [104, 140], mobile: [3, 38], rotate: -8 },
  { id: 'eyes', label: 'Eyes', art: <Eyes />, width: 124, box: [326, 40], mobile: [18, 2], rotate: 8 },
  { id: 'command', label: '⌘', art: <CommandHeart />, width: 104, box: [372, 330], mobile: [22, 70], rotate: -10 },
  { id: 'sprint', label: 'Sprint', art: <Sprint />, width: 222, box: [136, 410], mobile: [2, 84], rotate: -6 },
  { id: 'cursor', label: 'Cursor', art: <Cursor />, width: 124, box: [934, 60], mobile: [72, 8], rotate: 8 },
  { id: 'mouse', label: 'Mouse', art: <Mouse />, width: 72, box: [1000, 262], mobile: [80, 44], rotate: 12 },
  { id: 'laptop', label: 'Laptop', art: <Laptop />, width: 164, box: [1060, 420], mobile: [70, 82], rotate: -8 },
]

function Sticker({ spec, zone, index, onLift, z }: {
  spec: StickerSpec; zone: RefObject<HTMLDivElement | null>; index: number; onLift: () => void; z: number
}) {
  const { t } = useLocale()
  const { play } = useUISound()
  const x = useMotionValue(0), y = useMotionValue(0)
  const peel = useSpring(0, { stiffness: 320, damping: 26 })
  const [lifted, setLifted] = useState(false)
  const [hover, setHover] = useState(false)
  useEffect(() => { peel.set(lifted ? 1 : hover ? 0.35 : 0) }, [lifted, hover, peel])
  const [left, top] = spec.box
  const [mobileLeft, mobileTop] = spec.mobile
  const width = outerWidth(spec.width)
  // Phones keep the same proportions between stickers, about 1.4× larger relative to the screen.
  const style = { '--l': `${left / 13.6}%`, '--t': `${top / 8.33}%`, '--w': `${width / 13.6}%`,
    '--ml': `${mobileLeft}%`, '--mt': mobileTop, '--mw': `${(width / 13.6) * 1.4}%`, zIndex: z, x, y } as unknown as CSSProperties
  // Keyboard users move a sticker in 12px steps; Shift makes the step larger.
  const key = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 48 : 12
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault(); onLift()
    x.set(x.get() + move[0]); y.set(y.get() + move[1])
  }
  const drop = () => { if (lifted) play('stick'); setLifted(false) }
  return <motion.button type="button" className="sc-sticker" data-lifted={lifted} data-sound-skip style={style}
    aria-label={`${t('Стикер')}: ${spec.label}`} aria-describedby="sc-sticker-hint"
    drag dragConstraints={zone} dragMomentum={false} dragElastic={0.08}
    initial={{ opacity: 0, scale: 0.6, rotate: spec.rotate - 18 }}
    animate={{ opacity: 1, scale: lifted ? 1.1 : 1, rotate: lifted ? spec.rotate + 5 : spec.rotate }}
    transition={{ type: 'spring', stiffness: 420, damping: 22, opacity: { duration: 0.3, delay: 0.5 + index * 0.07 }, delay: lifted ? 0 : 0.5 + index * 0.07 }}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHover(true) }} onPointerLeave={() => setHover(false)}
    onPointerDown={() => { setLifted(true); onLift(); play('peel') }}
    onPointerUp={drop} onPointerCancel={drop}
    onDragEnd={drop} onKeyDown={key}>
    <PeelContext.Provider value={peel}>{spec.art}</PeelContext.Provider>
  </motion.button>
}

/** Peelable stickers around the portrait: press to lift one off, drag it anywhere in the hero, release to stick it. */
export function HeroStickers() {
  const { t } = useLocale()
  const zone = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState(() => stickers.map(sticker => sticker.id))
  const lift = (id: string) => setOrder(current => [...current.filter(item => item !== id), id])
  return <div className="sc-stickers" ref={zone}>
    <p className="sr-only" id="sc-sticker-hint">{t('Перетащите стикер мышью или двигайте стрелками')}</p>
    {stickers.map((spec, index) => <Sticker key={spec.id} spec={spec} zone={zone} index={index}
      z={10 + order.indexOf(spec.id)} onLift={() => lift(spec.id)} />)}
  </div>
}
