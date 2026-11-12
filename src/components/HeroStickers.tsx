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

const ink = '#080808', blue = '#2973ff', pink = '#ff8fc7', yellow = '#ffd02f'
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
  <rect width="200" height="124" rx="18" fill={blue} />
  <rect x="10" y="42" width="180" height="72" rx="10" fill="#fff" />
  <text x="16" y="30" fill="#fff" fontFamily={font} fontWeight="800" fontSize="18" letterSpacing=".6">HELLO, I’M</text>
  <text x="100" y="87" textAnchor="middle" fill={ink} fontFamily={font} fontWeight="700" fontSize="23">User Friendly</text>
</Art>

/** Type specimen. */
const Type = () => <Art box={[96, 96]} round={26} edge={<rect width="96" height="96" rx="26" />}>
  <rect width="96" height="96" rx="26" fill={pink} />
  <text x="48" y="64" textAnchor="middle" fill={ink} fontFamily={font} fontWeight="700" fontSize="42">Aa</text>
</Art>

/** Figma mark (public/icons/tools/figma.svg), authored at 288 × 432 and drawn at 64 × 96. */
const figmaParts = [
  ['M144 216C144 176.641 175.907 144.733 215.267 144.733C254.626 144.733 286.534 176.641 286.534 216C286.534 255.36 254.626 287.267 215.267 287.267C175.907 287.267 144 255.36 144 216Z', '#1ABCFE'],
  ['M1.466 358.534C1.466 319.175 33.373 287.267 72.733 287.267H144V358.534C144 397.894 112.093 429.801 72.733 429.801C33.373 429.801 1.466 397.894 1.466 358.534Z', '#0ACF83'],
  ['M144 2.199V144.733H215.267C254.627 144.733 286.534 112.826 286.534 73.466C286.534 34.107 254.627 2.199 215.267 2.199L144 2.199Z', '#FF7262'],
  ['M1.466 73.466C1.466 112.826 33.373 144.733 72.733 144.733L144 144.733L144 2.199L72.733 2.199C33.373 2.199 1.466 34.107 1.466 73.466Z', '#F24E1E'],
  ['M1.466 216C1.466 255.36 33.373 287.267 72.733 287.267H144L144 144.733L72.733 144.733C33.373 144.733 1.466 176.641 1.466 216Z', '#A259FF'],
] as const
const FigmaMark = () => <Art box={[64, 96]} scale={64 / 288} peel="tr" peelSize={0.3} round={14} edge={figmaParts.map(([d]) => <path key={d} d={d} />)}>
  {figmaParts.map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
</Art>

/** Pen tool: a bezier segment with anchors and handles. */
const Bezier = () => <Art box={[104, 104]} round={52} peelSize={0.2} edge={<circle cx="52" cy="52" r="52" />}>
  <circle cx="52" cy="52" r="52" fill={yellow} />
  <path d="M22 70 38 28M82 70 66 28" stroke={ink} strokeWidth="2.5" />
  <path d="M22 70C38 28 66 28 82 70" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
  <g fill={ink}><circle cx="38" cy="28" r="5" /><circle cx="66" cy="28" r="5" /></g>
  <g fill="#fff" stroke={ink} strokeWidth="3"><rect x="15" y="63" width="14" height="14" rx="3" /><rect x="75" y="63" width="14" height="14" rx="3" /></g>
</Art>

/** Multiplayer cursor with a name tag, as in a shared Figma file. */
const arrow = 'M6 4v60l15-13 11 25 12-5-11-24h22Z'
function Cursor() {
  const { t } = useLocale()
  return <Art box={[120, 96]} round={18} edge={<><path d={arrow} /><rect x="40" y="58" width="80" height="36" rx="18" /></>}>
    <path d={arrow} fill={blue} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
    <rect x="40" y="58" width="80" height="36" rx="18" fill={ink} />
    <text x="80" y="82" textAnchor="middle" fill="#fff" fontFamily={font} fontWeight="700" fontSize="17">{t('Софа')}</text>
  </Art>
}

/** The most pressed key in any design file. */
const Undo = () => <Art box={[96, 96]} peel="bl" round={26} edge={<rect width="96" height="96" rx="26" />}>
  <rect x="2.5" y="2.5" width="91" height="91" rx="24" fill="#fff" stroke={ink} strokeWidth="5" />
  <text x="48" y="61" textAnchor="middle" fill={ink} fontFamily={font} fontWeight="700" fontSize="32">⌘Z</text>
</Art>

/** The spacing grid. */
const Spacing = () => <Art box={[116, 60]} round={30} edge={<rect width="116" height="60" rx="30" />}>
  <rect width="116" height="60" rx="30" fill={ink} />
  <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 22v16M30 26v8M38 22v16" /></g>
  <text x="80" y="38" textAnchor="middle" fill="#fff" fontFamily={font} fontWeight="700" fontSize="22">4px</text>
</Art>

/** `box`: desktop [left, top] and artwork width on the 1360 × 833 zone; `mobile`: [left %, top % of the portrait height]. */
type StickerSpec = { id: string; label: string; art: ReactNode; width: number; box: [number, number]; mobile: [number, number]; rotate: number }

const stickers: StickerSpec[] = [
  { id: 'name', label: 'Hello, I’m User Friendly', art: <NameTag />, width: 200, box: [104, 140], mobile: [3, 38], rotate: -8 },
  { id: 'type', label: 'Aa', art: <Type />, width: 96, box: [338, 42], mobile: [20, 3], rotate: 9 },
  { id: 'figma', label: 'Figma', art: <FigmaMark />, width: 64, box: [396, 332], mobile: [24, 72], rotate: -12 },
  { id: 'pen', label: 'Pen tool', art: <Bezier />, width: 104, box: [192, 402], mobile: [6, 80], rotate: 10 },
  { id: 'cursor', label: 'Cursor', art: <Cursor />, width: 120, box: [934, 60], mobile: [72, 10], rotate: 8 },
  { id: 'undo', label: '⌘Z', art: <Undo />, width: 96, box: [982, 300], mobile: [78, 50], rotate: -10 },
  { id: 'spacing', label: '4px', art: <Spacing />, width: 116, box: [1124, 418], mobile: [80, 84], rotate: -6 },
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
