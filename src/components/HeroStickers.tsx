import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { useLocale } from '../i18n/locale'
import { publicAsset } from '../lib/publicAsset'

/* Flat die-cut stickers. The white border and shadow come from CSS drop-shadows, so every shape gets
   the same cut line. Positions are on the 1360 × 833 sticker zone around the portrait. */

const Fire = () => <svg viewBox="0 0 100 120" aria-hidden="true">
  <path d="M50 4c8 22 34 34 34 68 0 26-16 44-34 44-20 0-36-16-36-40 0-20 12-30 18-46 6 14 12 16 14 18 0-18-2-30 4-44Z" fill="#ff4d1a" />
  <path d="M52 58c8 12 16 20 16 34 0 12-8 18-16 18-10 0-16-8-16-16 0-14 12-20 16-36Z" fill="#ffe100" />
</svg>

const Globe = () => <svg viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="54" fill="#fff" stroke="#1f4dff" strokeWidth="8" />
  <g fill="none" stroke="#1f4dff" strokeWidth="6" strokeLinecap="round">
    <ellipse cx="60" cy="60" rx="24" ry="54" />
    <path d="M60 6v108M10 42h100M10 78h100" />
  </g>
  <ellipse cx="76" cy="56" rx="13" ry="15" fill="#fff" stroke="#080808" strokeWidth="3.5" />
  <ellipse cx="100" cy="56" rx="11" ry="14" fill="#fff" stroke="#080808" strokeWidth="3.5" />
  <circle cx="80" cy="58" r="7" fill="#080808" /><circle cx="103" cy="58" r="6.5" fill="#080808" />
</svg>

const Command = () => <svg viewBox="0 0 120 110" aria-hidden="true">
  <path d="M60 104C20 76 4 56 4 34 4 16 18 4 34 4c12 0 21 7 26 16 5-9 14-16 26-16 16 0 30 12 30 30 0 22-16 42-56 70Z" fill="#ff2d55" />
  <g transform="translate(36 23) scale(2)" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 9h6v6H9zM9 9H6a3 3 0 1 1 3-3v3M15 9V6a3 3 0 1 1 3 3h-3M15 15h3a3 3 0 1 1-3 3v-3M9 15v3a3 3 0 1 1-3-3h3" />
  </g>
</svg>

const Hand = () => <svg viewBox="0 0 110 120" aria-hidden="true">
  <g fill="#ff7ad9">
    <rect x="22" y="14" width="18" height="62" rx="9" />
    <rect x="42" y="4" width="18" height="70" rx="9" />
    <rect x="62" y="8" width="18" height="68" rx="9" />
    <rect x="82" y="22" width="16" height="56" rx="8" />
    <rect x="20" y="46" width="78" height="66" rx="30" />
    <rect x="-2" y="58" width="44" height="18" rx="9" transform="rotate(38 20 67)" />
  </g>
  <path d="M40 56v-8M60 54v-10M80 56v-8" stroke="#e85cbf" strokeWidth="3" strokeLinecap="round" />
</svg>

const Grid = () => <svg viewBox="0 0 120 120" aria-hidden="true">
  <g fill="#fff" stroke="#8b5cf6" strokeWidth="11">
    <rect x="8" y="8" width="44" height="44" rx="12" /><rect x="68" y="8" width="44" height="44" rx="12" />
    <rect x="8" y="68" width="44" height="44" rx="12" /><rect x="68" y="68" width="44" height="44" rx="12" />
  </g>
</svg>

const NameTag = () => <svg viewBox="0 0 300 190" aria-hidden="true">
  <rect x="4" y="4" width="292" height="182" rx="22" fill="#f2262f" />
  <rect x="16" y="64" width="268" height="108" rx="10" fill="#fff" />
  <text x="30" y="48" fill="#fff" fontFamily="'Manrope Variable', Manrope, sans-serif" fontWeight="800" fontSize="30" letterSpacing="1">HELLO, I’M</text>
  <text x="150" y="134" textAnchor="middle" fill="#080808" fontFamily="'Snell Roundhand', 'Segoe Script', 'Brush Script MT', cursive"
    fontStyle="italic" fontWeight="700" fontSize="44">User Friendly</text>
</svg>

const FigmaMark = () => <img src={publicAsset('/icons/tools/figma.svg')} alt="" width="288" height="432" draggable={false} />

/** `box`: desktop [left, top, width] on the 1360 × 833 zone; `mobile`: [left %, top % of the portrait height, width %]. */
type StickerSpec = { id: string; label: string; art: ReactNode; box: [number, number, number]; mobile: [number, number, number]; rotate: number }

const stickers: StickerSpec[] = [
  { id: 'name', mobile: [1, 34, 31], label: 'Hello, I’m User Friendly', art: <NameTag />, box: [70, 120, 300], rotate: -8 },
  { id: 'fire', mobile: [20, 2, 11], label: 'Fire', art: <Fire />, box: [330, 36, 100], rotate: 9 },
  { id: 'figma', mobile: [23, 72, 9], label: 'Figma', art: <FigmaMark />, box: [380, 330, 78], rotate: -14 },
  { id: 'globe', mobile: [73, 10, 18], label: 'Globe', art: <Globe />, box: [930, 56, 150], rotate: 10 },
  { id: 'command', mobile: [77, 50, 15], label: '⌘', art: <Command />, box: [960, 300, 140], rotate: -10 },
  { id: 'hand', mobile: [6, 78, 13], label: 'Hand', art: <Hand />, box: [190, 410, 120], rotate: 14 },
  { id: 'grid', mobile: [83, 82, 13], label: 'Grid', art: <Grid />, box: [1130, 400, 124], rotate: -12 },
]

function Sticker({ spec, zone, index, onLift, z }: {
  spec: StickerSpec; zone: RefObject<HTMLDivElement | null>; index: number; onLift: () => void; z: number
}) {
  const { t } = useLocale()
  const x = useMotionValue(0), y = useMotionValue(0)
  const [lifted, setLifted] = useState(false)
  const [left, top, width] = spec.box
  const [mobileLeft, mobileTop, mobileWidth] = spec.mobile
  const style = { '--l': `${left / 13.6}%`, '--t': `${top / 8.33}%`, '--w': `${width / 13.6}%`,
    '--ml': `${mobileLeft}%`, '--mt': mobileTop, '--mw': `${mobileWidth}%`, zIndex: z, x, y } as unknown as CSSProperties
  // Keyboard users move a sticker in 12px steps; Shift makes the step larger.
  const key = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 48 : 12
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault(); onLift()
    x.set(x.get() + move[0]); y.set(y.get() + move[1])
  }
  return <motion.button type="button" className="sc-sticker" data-lifted={lifted} style={style}
    aria-label={`${t('Стикер')}: ${spec.label}`} aria-describedby="sc-sticker-hint"
    drag dragConstraints={zone} dragMomentum={false} dragElastic={0.08}
    initial={{ opacity: 0, scale: 0.6, rotate: spec.rotate - 18 }}
    animate={{ opacity: 1, scale: lifted ? 1.1 : 1, rotate: lifted ? spec.rotate + 5 : spec.rotate }}
    transition={{ type: 'spring', stiffness: 420, damping: 22, opacity: { duration: 0.3, delay: 0.5 + index * 0.07 }, delay: lifted ? 0 : 0.5 + index * 0.07 }}
    onPointerDown={() => { setLifted(true); onLift() }}
    onPointerUp={() => setLifted(false)} onPointerCancel={() => setLifted(false)}
    onDragEnd={() => setLifted(false)} onKeyDown={key}>
    {spec.art}
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
