/* oxlint-disable react/immutability, react/purity -- this isolated rAF physics engine mutates ref-owned bodies without React renders. */
import { Fragment, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useMotionSystem } from '../lib/motion'

const tools = [
  ['Figma', 'figma', 0], ['Figma Motion', 'figma-motion', -4.02], ['FigJam', 'figjam', 11.17],
  ['ProtoPie', 'protopie', 0], ['Principle', 'principle', -5.46], ['Miro', 'miro', 5.06],
  ['Яндекс Метрика', 'metrica', 2.13], ['Google Analytics', 'analytics', -2.38], ['Notion', 'notion', 0],
  ['Jira', 'jira', -7.16], ['Confluence', 'confluence', -4.02], ['ChatGPT', 'chatgpt', -3.39],
  ['Codex', 'codex', -2.79], ['Claude', 'claude', 3.46], ['Cursor', 'cursor', 4.72],
] as const

type Body = {
  element: HTMLLIElement; originX: number; originY: number; width: number; height: number
  x: number; y: number; vx: number; vy: number; angle: number; baseAngle: number; angularVelocity: number
  dragging: boolean; pointerId: number | null; lastX: number; lastY: number; lastTime: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function InteractiveToolCloud() {
  const containerRef = useRef<HTMLUListElement>(null)
  const bodiesRef = useRef<Body[]>([])
  const frameRef = useRef(0)
  const lastFrameRef = useRef(0)
  const { reduced, adaptive } = useMotionSystem()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      bodiesRef.current = Array.from(container.querySelectorAll<HTMLLIElement>('.home-tool')).map((element, index) => {
        const bounds = element.getBoundingClientRect()
        const baseAngle = adaptive ? 0 : tools[index][2]
        const body: Body = {
          element, originX: element.offsetLeft, originY: element.offsetTop,
          width: bounds.width, height: bounds.height, x: 0, y: 0, vx: 0, vy: 0,
          angle: baseAngle, baseAngle, angularVelocity: 0, dragging: false, pointerId: null,
          lastX: 0, lastY: 0, lastTime: 0,
        }
        element.style.transform = `translate3d(0px, 0px, 0px) rotate(${baseAngle}deg)`
        return body
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => { observer.disconnect(); cancelAnimationFrame(frameRef.current) }
  }, [adaptive])

  const paint = (body: Body) => {
    body.element.style.transform = `translate3d(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px, 0px) rotate(${body.angle.toFixed(2)}deg)`
  }

  const contain = (body: Body, bounce: boolean) => {
    const container = containerRef.current
    if (!container) return
    const maxX = Math.max(0, container.clientWidth - body.originX - body.width)
    const maxY = Math.max(0, container.clientHeight - body.originY - body.height)
    const minX = -body.originX
    const minY = -body.originY
    if (body.x < minX || body.x > maxX) {
      body.x = clamp(body.x, minX, maxX)
      if (bounce) body.vx *= -.52
    }
    if (body.y < minY || body.y > maxY) {
      body.y = clamp(body.y, minY, maxY)
      if (bounce) body.vy *= -.52
    }
  }

  const resolveCollisions = () => {
    const bodies = bodiesRef.current
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]
      const b = bodies[j]
      const aMoving = a.dragging || Math.abs(a.vx) + Math.abs(a.vy) > 3
      const bMoving = b.dragging || Math.abs(b.vx) + Math.abs(b.vy) > 3
      if (!aMoving && !bMoving) continue
      const ax = a.originX + a.x + a.width / 2
      const ay = a.originY + a.y + a.height / 2
      const bx = b.originX + b.x + b.width / 2
      const by = b.originY + b.y + b.height / 2
      const overlapX = (a.width + b.width) * .41 - Math.abs(ax - bx)
      const overlapY = (a.height + b.height) * .34 - Math.abs(ay - by)
      if (overlapX <= 0 || overlapY <= 0) continue
      const horizontal = overlapX < overlapY
      const direction = horizontal ? (ax < bx ? -1 : 1) : (ay < by ? -1 : 1)
      const overlap = horizontal ? overlapX : overlapY
      const aShare = a.dragging ? 0 : b.dragging ? 1 : .5
      const bShare = b.dragging ? 0 : a.dragging ? 1 : .5
      if (horizontal) {
        a.x += direction * overlap * aShare
        b.x -= direction * overlap * bShare
        const velocity = a.vx
        if (!a.dragging) a.vx = b.vx * .58
        if (!b.dragging) b.vx = velocity * .58
      } else {
        a.y += direction * overlap * aShare
        b.y -= direction * overlap * bShare
        const velocity = a.vy
        if (!a.dragging) a.vy = b.vy * .58
        if (!b.dragging) b.vy = velocity * .58
      }
      if (!a.dragging) a.angularVelocity = clamp(a.angularVelocity + direction * 2, -10, 10)
      if (!b.dragging) b.angularVelocity = clamp(b.angularVelocity - direction * 2, -10, 10)
      contain(a, true); contain(b, true)
    }
  }

  const animate = (time: number) => {
    const dt = Math.min(.032, Math.max(.001, (time - (lastFrameRef.current || time)) / 1000))
    lastFrameRef.current = time
    let moving = false
    for (const body of bodiesRef.current) {
      if (!body.dragging) {
        body.x += body.vx * dt
        body.y += body.vy * dt
        body.angle = clamp(body.angle + body.angularVelocity * dt, body.baseAngle - 14, body.baseAngle + 14)
        const friction = Math.pow(.12, dt)
        body.vx *= friction
        body.vy *= friction
        body.angularVelocity *= Math.pow(.08, dt)
        contain(body, true)
        if (Math.abs(body.vx) < 2) body.vx = 0
        if (Math.abs(body.vy) < 2) body.vy = 0
        if (Math.abs(body.angularVelocity) < .5) body.angularVelocity = 0
      }
      moving ||= body.dragging || body.vx !== 0 || body.vy !== 0 || body.angularVelocity !== 0
    }
    if (!reduced) resolveCollisions()
    bodiesRef.current.forEach(paint)
    if (moving) frameRef.current = requestAnimationFrame(animate)
    else { frameRef.current = 0; lastFrameRef.current = 0 }
  }

  const ensureAnimation = () => {
    if (!frameRef.current) {
      lastFrameRef.current = 0
      frameRef.current = requestAnimationFrame(animate)
    }
  }

  const bodyFor = (index: number) => bodiesRef.current[index]
  const onPointerDown = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const body = bodyFor(index)
    if (!body) return
    body.dragging = true
    body.pointerId = event.pointerId
    body.lastX = event.clientX
    body.lastY = event.clientY
    body.lastTime = performance.now()
    body.vx = 0; body.vy = 0; body.angularVelocity = 0
    event.currentTarget.setPointerCapture(event.pointerId)
    body.element.dataset.dragging = 'true'
    ensureAnimation()
  }
  const onPointerMove = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    const body = bodyFor(index)
    if (!body?.dragging || body.pointerId !== event.pointerId) return
    const now = performance.now()
    const dt = Math.max(8, now - body.lastTime) / 1000
    const dx = event.clientX - body.lastX
    const dy = event.clientY - body.lastY
    body.x += dx; body.y += dy
    body.vx = clamp(dx / dt, -900, 900)
    body.vy = clamp(dy / dt, -900, 900)
    body.angularVelocity = reduced ? 0 : clamp(body.vx * .012, -8, 8)
    body.lastX = event.clientX; body.lastY = event.clientY; body.lastTime = now
    contain(body, false)
    if (!reduced) resolveCollisions()
    bodiesRef.current.forEach(paint)
  }
  const release = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    const body = bodyFor(index)
    if (!body?.dragging || body.pointerId !== event.pointerId) return
    body.dragging = false
    body.pointerId = null
    delete body.element.dataset.dragging
    if (reduced) { body.vx = 0; body.vy = 0; body.angularVelocity = 0 }
    ensureAnimation()
  }
  const onKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const body = bodyFor(index)
    if (!body || !event.key.startsWith('Arrow')) return
    event.preventDefault()
    const distance = event.shiftKey ? 24 : 10
    if (event.key === 'ArrowLeft') body.x -= distance
    if (event.key === 'ArrowRight') body.x += distance
    if (event.key === 'ArrowUp') body.y -= distance
    if (event.key === 'ArrowDown') body.y += distance
    contain(body, false)
    paint(body)
  }

  return <Fragment>
    <p className="sr-only" id="tool-cloud-instructions">Инструменты можно перетаскивать мышью или пальцем. Для перемещения с клавиатуры используйте стрелки; Shift увеличивает шаг.</p>
    <ul ref={containerRef} className="home-tool-cloud" aria-label="Инструменты" aria-describedby="tool-cloud-instructions">
      {tools.map(([label, id], index) => <li className={`home-tool home-tool--${id}`} data-ai={['chatgpt', 'codex', 'claude', 'cursor'].includes(id) || undefined} key={id}>
        <button type="button" className="home-tool-action" aria-label={`${label}. Перетаскиваемый инструмент`}
          aria-describedby="tool-cloud-instructions" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onKeyDown={event => onKeyDown(index, event)} onPointerDown={event => onPointerDown(index, event)}
          onPointerMove={event => onPointerMove(index, event)} onPointerUp={event => release(index, event)} onPointerCancel={event => release(index, event)}>{label}</button>
      </li>)}
    </ul>
  </Fragment>
}
