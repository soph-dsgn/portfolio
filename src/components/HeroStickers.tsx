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

/** One drawing rule for every sticker: flat fills from this palette, no outlines, the white die-cut does the edge. */
const ink = '#080808', blue = '#2973ff', yellow = '#ffd02f', orange = '#ff7a3d', coral = '#ff5c7a', silver = '#d9d9de'
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

/** The word on every team board: heavy slanted letters on a flat ink shadow. */
const sprintText = (props: Record<string, unknown>) => <text x="10" y="64" fontFamily={font} fontWeight="800" fontSize="58"
  textLength="196" lengthAdjust="spacingAndGlyphs" transform="skewX(-12) translate(14 0)" {...props}>SPRINT</text>
const Sprint = () => <Art box={[222, 84]} peelSize={0.3} edge={<g>{[0, 4, 8].map(d => <g key={d} transform={`translate(${d} ${d})`}>{sprintText({})}</g>)}</g>}>
  {[7, 5, 3].map(d => <g key={d} transform={`translate(${d} ${d})`}>{sprintText({ fill: ink })}</g>)}
  {sprintText({ fill: orange })}
</Art>

/** Command key in a heart: the shortcut that runs the whole working day. */
const heart = 'M52 93C22 73 3 55 3 32 3 15 15 3 30 3c10 0 18 5 22 13C56 8 64 3 74 3c15 0 27 12 27 29 0 23-19 41-49 61Z'
const CommandHeart = () => <Art box={[104, 96]} peel="bl" round={24} peelSize={0.22} edge={<path d={heart} />}>
  <path d={heart} fill={coral} />
  <path transform="translate(31 22) scale(1.75)" d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
    fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</Art>

/** A pair of eyes watching the cursor, on an ink pill. */
const Eyes = () => <Art box={[128, 76]} round={38} peelSize={0.3} edge={<rect width="128" height="76" rx="38" />}>
  <rect width="128" height="76" rx="38" fill={ink} />
  <ellipse cx="42" cy="38" rx="22" ry="26" fill="#fff" />
  <ellipse cx="86" cy="38" rx="22" ry="26" fill="#fff" />
  <circle cx="49" cy="42" r="11" fill={ink} />
  <circle cx="93" cy="42" r="11" fill={ink} />
</Art>

/** The Figma pointer on its own. */
const arrow = 'M8 6 62 27 37 36 27 62Z'
const Cursor = () => <Art box={[68, 68]} round={8} peelSize={0.34} edge={<path d={arrow} strokeLinejoin="round" />}>
  <path d={arrow} fill={ink} stroke={ink} strokeWidth="6" strokeLinejoin="round" />
</Art>

/** Mouse: two buttons and the scroll wheel. */
const Mouse = () => <Art box={[72, 108]} round={34} peelSize={0.3} edge={<rect width="72" height="108" rx="34" />}>
  <rect width="72" height="108" rx="34" fill={yellow} />
  <path d="M36 0v38M0 40h72" fill="none" stroke={ink} strokeWidth="3" />
  <rect x="30" y="13" width="12" height="20" rx="6" fill={ink} />
</Art>

/** MacBook, open: aluminium lid, a thin black bezel with the notch, the base with its thumb cut. */
const Laptop = () => <Art box={[176, 112]} peel="tr" round={12} peelSize={0.22} edge={<><rect x="16" width="144" height="98" rx="12" /><path d="M0 96h176v6a10 10 0 0 1-10 10H10A10 10 0 0 1 0 102Z" /></>}>
  <rect x="16" width="144" height="98" rx="12" fill={silver} />
  <rect x="23" y="7" width="130" height="86" rx="6" fill={ink} />
  <rect x="29" y="13" width="118" height="74" rx="3" fill={blue} />
  <rect x="78" y="7" width="20" height="7" rx="3.5" fill={ink} />
  <path d="M0 96h176v6a10 10 0 0 1-10 10H10A10 10 0 0 1 0 102Z" fill="#c4c4cb" />
  <rect x="72" y="96" width="32" height="5" rx="2.5" fill="#a9a9b1" />
</Art>

/** `box`: desktop [left, top] and artwork width on the 1360 × 833 zone; `mobile`: [left %, top % of the portrait height]. */
type StickerSpec = { id: string; label: string; art: ReactNode; width: number; box: [number, number]; mobile: [number, number]; rotate: number }

const stickers: StickerSpec[] = [
  // left of the portrait
  { id: 'eyes', label: 'Eyes', art: <Eyes />, width: 128, box: [326, 40], mobile: [18, 2], rotate: 8 },
  { id: 'name', label: 'Hello, I’m User Friendly', art: <NameTag />, width: 200, box: [104, 140], mobile: [3, 36], rotate: -8 },
  { id: 'command', label: '⌘', art: <CommandHeart />, width: 104, box: [250, 300], mobile: [8, 60], rotate: -10 },
  { id: 'sprint', label: 'Sprint', art: <Sprint />, width: 222, box: [120, 440], mobile: [2, 86], rotate: -6 },
  // right of the portrait
  { id: 'cursor', label: 'Cursor', art: <Cursor />, width: 68, box: [946, 56], mobile: [72, 6], rotate: 0 },
  { id: 'figma', label: 'Figma', art: <FigmaMark />, width: 64, box: [1150, 110], mobile: [86, 24], rotate: 12 },
  { id: 'mouse', label: 'Mouse', art: <Mouse />, width: 72, box: [990, 270], mobile: [78, 50], rotate: 12 },
  { id: 'laptop', label: 'MacBook', art: <Laptop />, width: 176, box: [1080, 430], mobile: [68, 80], rotate: -8 },
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
