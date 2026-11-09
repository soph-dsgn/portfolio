/* oxlint-disable react/immutability, react/purity -- the rAF physics engine mutates ref-owned bodies without React renders. */
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
  element: HTMLLIElement
  originX: number
  originY: number
  width: number
  height: number
  halfWidth: number
  halfHeight: number
  boundHalfWidth: number
  boundHalfHeight: number
  x: number
  y: number
  vx: number
  vy: number
  baseAngle: number
  dragging: boolean
  pointerId: number | null
  lastX: number
  lastY: number
  lastTime: number
}

const MAX_RELEASE_SPEED = 420
const MAX_DRAG_SAMPLE_SPEED = 720
const RELEASE_VELOCITY_SCALE = .34
const VELOCITY_SMOOTHING = .32
const LINEAR_DAMPING = .035
const WALL_RESTITUTION = .04
const WALL_SOFT_ZONE = 22
const WALL_APPROACH_DAMPING = 16
const DRAG_EDGE_ZONE = 26
const DRAG_EDGE_MIN_FACTOR = .16
const BOUNDARY_INSET = 1
const COLLISION_RESTITUTION = .04
const MAX_COLLISION_IMPULSE = 90
const COLLISION_GAP = 1
const COLLISION_POSITION_SLOP = .25
const COLLISION_PASSES = 10
const FIXED_STEP = 1 / 120
const SLEEP_SPEED = 5

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function InteractiveToolCloud() {
  const containerRef = useRef<HTMLUListElement>(null)
  const containerSizeRef = useRef({ width: 0, height: 0 })
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
      lastFrameRef.current = 0
      containerSizeRef.current = { width: container.clientWidth, height: container.clientHeight }
      bodiesRef.current = Array.from(container.querySelectorAll<HTMLLIElement>('.home-tool')).map((element, index) => {
        const width = element.offsetWidth
        const height = element.offsetHeight
        const baseAngle = adaptive ? 0 : tools[index][2]
        const radians = Math.abs(baseAngle) * Math.PI / 180
        const cosine = Math.cos(radians)
        const sine = Math.sin(radians)
        const boundHalfWidth = (width * cosine + height * sine) / 2
        const boundHalfHeight = (width * sine + height * cosine) / 2
        const body: Body = {
          element,
          originX: element.offsetLeft,
          originY: element.offsetTop,
          width,
          height,
          halfWidth: width / 2,
          halfHeight: height / 2,
          boundHalfWidth,
          boundHalfHeight,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          baseAngle,
          dragging: false,
          pointerId: null,
          lastX: 0,
          lastY: 0,
          lastTime: 0,
        }
        const centerX = body.originX + body.width / 2
        const centerY = body.originY + body.height / 2
        const minX = body.boundHalfWidth + BOUNDARY_INSET - centerX
        const maxX = container.clientWidth - body.boundHalfWidth - BOUNDARY_INSET - centerX
        const minY = body.boundHalfHeight + BOUNDARY_INSET - centerY
        const maxY = container.clientHeight - body.boundHalfHeight - BOUNDARY_INSET - centerY
        body.x = clamp(0, minX, Math.max(minX, maxX))
        body.y = clamp(0, minY, Math.max(minY, maxY))
        element.style.transform = `translate3d(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px, 0px) rotate(${baseAngle}deg)`
        return body
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [adaptive])

  const paint = (body: Body) => {
    body.element.style.transform = `translate3d(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px, 0px) rotate(${body.baseAngle}deg)`
  }

  const limits = (body: Body) => {
    const { width: containerWidth, height: containerHeight } = containerSizeRef.current
    if (!containerWidth || !containerHeight) return { minX: body.x, maxX: body.x, minY: body.y, maxY: body.y }
    const centerX = body.originX + body.width / 2
    const centerY = body.originY + body.height / 2
    return {
      minX: body.boundHalfWidth + BOUNDARY_INSET - centerX,
      maxX: containerWidth - body.boundHalfWidth - BOUNDARY_INSET - centerX,
      minY: body.boundHalfHeight + BOUNDARY_INSET - centerY,
      maxY: containerHeight - body.boundHalfHeight - BOUNDARY_INSET - centerY,
    }
  }

  const contain = (body: Body, bounce: boolean) => {
    const { minX, maxX, minY, maxY } = limits(body)
    const nextX = clamp(body.x, minX, Math.max(minX, maxX))
    const nextY = clamp(body.y, minY, Math.max(minY, maxY))
    if (nextX !== body.x && bounce && Math.sign(body.vx) === Math.sign(body.x - nextX)) body.vx *= -WALL_RESTITUTION
    if (nextY !== body.y && bounce && Math.sign(body.vy) === Math.sign(body.y - nextY)) body.vy *= -WALL_RESTITUTION
    body.x = nextX
    body.y = nextY
  }

  const moveWithinBounds = (body: Body, dx: number, dy: number) => {
    const beforeX = body.x
    const beforeY = body.y
    body.x += dx
    body.y += dy
    contain(body, false)
    return { dx: body.x - beforeX, dy: body.y - beforeY }
  }

  const softenDragAxis = (value: number, delta: number, min: number, max: number) => {
    if (!delta) return value
    const distanceToEdge = delta < 0 ? value - min : max - value
    const progress = clamp(distanceToEdge / DRAG_EDGE_ZONE, 0, 1)
    const resistance = DRAG_EDGE_MIN_FACTOR + (1 - DRAG_EDGE_MIN_FACTOR) * progress * progress
    return clamp(value + delta * resistance, min, max)
  }

  const softenWallVelocity = (body: Body, dt: number) => {
    const { minX, maxX, minY, maxY } = limits(body)
    const dampOutwardVelocity = (velocity: number, distance: number, outward: boolean) => {
      if (!outward || distance >= WALL_SOFT_ZONE) return velocity
      const proximity = 1 - clamp(distance / WALL_SOFT_ZONE, 0, 1)
      return velocity * Math.exp(-WALL_APPROACH_DAMPING * proximity * dt)
    }
    body.vx = dampOutwardVelocity(body.vx, body.x - minX, body.vx < 0)
    body.vx = dampOutwardVelocity(body.vx, maxX - body.x, body.vx > 0)
    body.vy = dampOutwardVelocity(body.vy, body.y - minY, body.vy < 0)
    body.vy = dampOutwardVelocity(body.vy, maxY - body.y, body.vy > 0)
  }

  const resolvePair = (a: Body, b: Body) => {
    const ax = a.originX + a.x + a.width / 2
    const ay = a.originY + a.y + a.height / 2
    const bx = b.originX + b.x + b.width / 2
    const by = b.originY + b.y + b.height / 2
    const overlapX = a.halfWidth + b.halfWidth + COLLISION_GAP - Math.abs(bx - ax)
    const overlapY = a.halfHeight + b.halfHeight + COLLISION_GAP - Math.abs(by - ay)
    if (overlapX <= 0 || overlapY <= 0) return false

    const horizontal = overlapX < overlapY
    const nx = horizontal ? (bx >= ax ? 1 : -1) : 0
    const ny = horizontal ? 0 : (by >= ay ? 1 : -1)
    const penetration = (horizontal ? overlapX : overlapY) - COLLISION_POSITION_SLOP
    if (penetration <= 0) return false

    let corrected = false

    if (a.dragging && !b.dragging) {
      const moved = moveWithinBounds(b, nx * penetration, ny * penetration)
      const resolved = Math.abs(moved.dx * nx + moved.dy * ny)
      const residual = Math.max(0, penetration - resolved)
      if (residual > 0) moveWithinBounds(a, -nx * residual, -ny * residual)
      corrected = resolved > .01 || residual > .01
    } else if (b.dragging && !a.dragging) {
      const moved = moveWithinBounds(a, -nx * penetration, -ny * penetration)
      const resolved = Math.abs(moved.dx * nx + moved.dy * ny)
      const residual = Math.max(0, penetration - resolved)
      if (residual > 0) moveWithinBounds(b, nx * residual, ny * residual)
      corrected = resolved > .01 || residual > .01
    } else {
      const movedA = moveWithinBounds(a, -nx * penetration * .5, -ny * penetration * .5)
      const movedB = moveWithinBounds(b, nx * penetration * .5, ny * penetration * .5)
      corrected = Math.abs(movedA.dx) + Math.abs(movedA.dy) + Math.abs(movedB.dx) + Math.abs(movedB.dy) > .01
    }

    const inverseMassA = a.dragging ? 0 : 1
    const inverseMassB = b.dragging ? 0 : 1
    const inverseMass = inverseMassA + inverseMassB
    const relativeNormalVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
    if (!a.dragging && !b.dragging && inverseMass > 0 && relativeNormalVelocity < 0) {
      const impulse = Math.min(MAX_COLLISION_IMPULSE, -(1 + COLLISION_RESTITUTION) * relativeNormalVelocity / inverseMass)
      if (inverseMassA) {
        a.vx -= impulse * nx
        a.vy -= impulse * ny
      }
      if (inverseMassB) {
        b.vx += impulse * nx
        b.vy += impulse * ny
      }
    }
    return corrected
  }

  const resolveCollisions = () => {
    const bodies = bodiesRef.current
    let unresolved = false
    for (let pass = 0; pass < COLLISION_PASSES; pass++) {
      let collided = false
      for (let index = 0; index < bodies.length; index++) {
        for (let otherIndex = index + 1; otherIndex < bodies.length; otherIndex++) {
          const a = bodies[index]
          const b = bodies[otherIndex]
          collided = resolvePair(a, b) || collided
        }
      }
      unresolved = collided
      if (!collided) break
    }
    return unresolved
  }

  const simulate = (dt: number) => {
    for (const body of bodiesRef.current) {
      if (body.dragging) continue
      softenWallVelocity(body, dt)
      body.x += body.vx * dt
      body.y += body.vy * dt
      contain(body, true)
    }
    const resolving = resolveCollisions()
    const damping = Math.pow(LINEAR_DAMPING, dt)
    for (const body of bodiesRef.current) {
      if (body.dragging) continue
      body.vx *= damping
      body.vy *= damping
      if (Math.hypot(body.vx, body.vy) < SLEEP_SPEED) {
        body.vx = 0
        body.vy = 0
      }
    }
    return resolving
  }

  const animate = (time: number) => {
    const elapsed = Math.min(.034, Math.max(0, (time - (lastFrameRef.current || time)) / 1000))
    lastFrameRef.current = time
    let remaining = elapsed
    let resolving = false
    while (remaining > 0) {
      const step = Math.min(FIXED_STEP, remaining)
      resolving = simulate(step) || resolving
      remaining -= step
    }

    let moving = resolving
    for (const body of bodiesRef.current) {
      paint(body)
      moving ||= body.dragging || body.vx !== 0 || body.vy !== 0
    }
    if (moving) frameRef.current = requestAnimationFrame(animate)
    else {
      frameRef.current = 0
      lastFrameRef.current = 0
    }
  }

  const ensureAnimation = () => {
    if (frameRef.current) return
    lastFrameRef.current = 0
    frameRef.current = requestAnimationFrame(animate)
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
    body.vx = 0
    body.vy = 0
    event.currentTarget.setPointerCapture(event.pointerId)
    body.element.dataset.dragging = 'true'
    ensureAnimation()
  }

  const onPointerMove = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    const body = bodyFor(index)
    if (!body?.dragging || body.pointerId !== event.pointerId) return
    if (event.cancelable) event.preventDefault()
    const now = performance.now()
    const dt = Math.max(8, now - body.lastTime) / 1000
    const dx = event.clientX - body.lastX
    const dy = event.clientY - body.lastY
    const sampledVX = clamp(dx / dt, -MAX_DRAG_SAMPLE_SPEED, MAX_DRAG_SAMPLE_SPEED)
    const sampledVY = clamp(dy / dt, -MAX_DRAG_SAMPLE_SPEED, MAX_DRAG_SAMPLE_SPEED)
    body.vx += (sampledVX - body.vx) * VELOCITY_SMOOTHING
    body.vy += (sampledVY - body.vy) * VELOCITY_SMOOTHING
    const { minX, maxX, minY, maxY } = limits(body)
    body.x = softenDragAxis(body.x, dx, minX, Math.max(minX, maxX))
    body.y = softenDragAxis(body.y, dy, minY, Math.max(minY, maxY))
    body.lastX = event.clientX
    body.lastY = event.clientY
    body.lastTime = now
    resolveCollisions()
    bodiesRef.current.forEach(paint)
  }

  const release = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    const body = bodyFor(index)
    if (!body?.dragging || body.pointerId !== event.pointerId) return
    body.dragging = false
    body.pointerId = null
    delete body.element.dataset.dragging
    if (reduced) {
      body.vx = 0
      body.vy = 0
    } else {
      body.vx = clamp(body.vx * RELEASE_VELOCITY_SCALE, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED)
      body.vy = clamp(body.vy * RELEASE_VELOCITY_SCALE, -MAX_RELEASE_SPEED, MAX_RELEASE_SPEED)
    }
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
    body.vx = 0
    body.vy = 0
    contain(body, false)
    resolveCollisions()
    bodiesRef.current.forEach(paint)
  }

  return <Fragment>
    <p className="sr-only" id="tool-cloud-instructions">Инструменты можно перетаскивать мышью или пальцем. Для перемещения с клавиатуры используйте стрелки; Shift увеличивает шаг.</p>
    <ul ref={containerRef} className="home-tool-cloud" aria-label="Инструменты" aria-describedby="tool-cloud-instructions">
      {tools.map(([label, id], index) => <li className={`home-tool home-tool--${id}`} data-ai={['chatgpt', 'codex', 'claude', 'cursor'].includes(id) || undefined} key={id}>
        <button type="button" className="home-tool-action" aria-label={`${label}. Перетаскиваемый инструмент`}
          aria-describedby="tool-cloud-instructions" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onKeyDown={event => onKeyDown(index, event)} onPointerDown={event => onPointerDown(index, event)}
          onPointerMove={event => onPointerMove(index, event)} onPointerUp={event => release(index, event)}
          onPointerCancel={event => release(index, event)} onLostPointerCapture={event => release(index, event)}>{label}</button>
      </li>)}
    </ul>
  </Fragment>
}
