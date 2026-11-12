/* oxlint-disable react/immutability -- Matter owns and mutates its world outside React's render cycle. */
import { useEffect, useEffectEvent, useRef, type KeyboardEvent } from 'react'
import * as Matter from 'matter-js'
import { useMotionSystem } from '../lib/motion'
import { useUISound } from '../lib/soundContext'
import { useLocale } from '../i18n/locale'

const tools = [
  ['Figma', 'figma', 0], ['Figma Motion', 'figma-motion', -4.02], ['FigJam', 'figjam', 11.17],
  ['ProtoPie', 'protopie', 0], ['Principle', 'principle', -5.46], ['Miro', 'miro', 5.06],
  ['Яндекс Метрика', 'metrica', 2.13], ['Google Analytics', 'analytics', -2.38], ['Notion', 'notion', 0],
  ['Jira', 'jira', -7.16], ['Confluence', 'confluence', -4.02], ['ChatGPT', 'chatgpt', -3.39],
  ['Codex', 'codex', -2.79], ['Claude', 'claude', 3.46], ['Cursor', 'cursor', 4.72],
] as const

type ToolBody = {
  body: Matter.Body
  element: HTMLLIElement
  width: number
  height: number
}

type PhysicsState = {
  engine: Matter.Engine
  tools: ToolBody[]
  walls: Matter.Body[]
  dragConstraint: Matter.Constraint | null
  draggedBody: Matter.Body | null
  activePointerId: number | null
  width: number
  height: number
  frame: number
  lastFrame: number
  resizeFrame: number
  running: boolean
  visible: boolean
  lastPointerX: number
  lastPointerY: number
  lastPointerTime: number
  releaseVelocityX: number
  releaseVelocityY: number
}

const WALL_THICKNESS = 96
const EDGE_INSET = 2
const MAX_RELEASE_VELOCITY = 20
const BASE_FRAME = 1000 / 60

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const setToolTransform = ({ body, element, width, height }: ToolBody) => {
  const x = body.position.x - width / 2
  const y = body.position.y - height / 2
  element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${body.angle.toFixed(5)}rad)`
}

const makeWalls = (width: number, height: number) => {
  const options: Matter.IChamferableBodyDefinition = {
    isStatic: true,
    label: 'tool-cloud-boundary',
    friction: .2,
    restitution: .16,
  }
  return [
    Matter.Bodies.rectangle(width / 2, -WALL_THICKNESS / 2 + EDGE_INSET, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    Matter.Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2 - EDGE_INSET, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    Matter.Bodies.rectangle(-WALL_THICKNESS / 2 + EDGE_INSET, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, options),
    Matter.Bodies.rectangle(width + WALL_THICKNESS / 2 - EDGE_INSET, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, options),
  ]
}

const findInitialPositions = (elements: HTMLLIElement[], width: number, height: number) => {
  const positions = new Array<{ x: number; y: number }>(elements.length)
  const gap = 8
  const inset = 10
  const preferredRows = width < 560 ? [4, 4, 3, 2, 2] : [5, 4, 3, 2, 1]
  let cursor = 0
  let bottom = height - inset

  for (let rowIndex = 0; rowIndex < preferredRows.length && cursor < elements.length; rowIndex += 1) {
    let count = Math.min(preferredRows[rowIndex], elements.length - cursor)
    while (count > 1) {
      const occupied = elements.slice(cursor, cursor + count).reduce((sum, element) => sum + element.offsetWidth, 0) + gap * (count - 1)
      if (occupied <= width - inset * 2) break
      count -= 1
    }

    const row = elements.slice(cursor, cursor + count)
    const rowHeight = Math.max(...row.map(element => element.offsetHeight))
    const rowWidth = row.reduce((sum, element) => sum + element.offsetWidth, 0) + gap * (row.length - 1)
    let x = (width - rowWidth) / 2 + (rowIndex % 2 === 0 ? -5 : 7)
    const y = Math.max(inset + rowHeight / 2, bottom - rowHeight / 2)

    row.forEach((element, localIndex) => {
      positions[cursor + localIndex] = { x: x + element.offsetWidth / 2, y }
      x += element.offsetWidth + gap
    })
    cursor += count
    bottom = y - rowHeight / 2 - gap
  }

  while (cursor < elements.length) {
    const element = elements[cursor]
    positions[cursor] = { x: width / 2, y: Math.max(inset + element.offsetHeight / 2, bottom - element.offsetHeight / 2) }
    bottom -= element.offsetHeight + gap
    cursor += 1
  }
  return positions
}

export function InteractiveToolCloud() {
  const containerRef = useRef<HTMLUListElement>(null)
  const physicsRef = useRef<PhysicsState | null>(null)
  const startRef = useRef<(() => void) | null>(null)
  const { reduced } = useMotionSystem()
  const { play } = useUISound()
  const { t } = useLocale()
  const tap = useEffectEvent(() => play('chip'))

  useEffect(() => {
    const container = containerRef.current
    if (!container || reduced) return

    const elements = Array.from(container.querySelectorAll<HTMLLIElement>('.home-tool'))
    const width = container.clientWidth
    const height = container.clientHeight
    if (!width || !height) return

    const engine = Matter.Engine.create({ enableSleeping: true })
    engine.gravity.x = 0
    engine.gravity.y = .88
    engine.gravity.scale = .001
    engine.positionIterations = 10
    engine.velocityIterations = 8
    engine.constraintIterations = 4

    const initialPositions = findInitialPositions(elements, width, height)
    const toolBodies = elements.map((element, index): ToolBody => {
      const toolWidth = element.offsetWidth
      const toolHeight = element.offsetHeight
      const position = initialPositions[index]
      const body = Matter.Bodies.rectangle(position.x, Math.max(toolHeight / 2 + 4, position.y - 38), toolWidth, toolHeight, {
        label: `tool-${tools[index][1]}`,
        angle: width < 600 ? 0 : tools[index][2] * Math.PI / 180,
        chamfer: { radius: Math.min(toolHeight / 2, 18) },
        density: .0014,
        friction: .16,
        frictionAir: .025,
        frictionStatic: .45,
        restitution: .2,
        sleepThreshold: 42,
      })
      return { body, element, width: toolWidth, height: toolHeight }
    })

    const walls = makeWalls(width, height)
    const collider = Matter.Bodies.circle(-100, -100, 22, { isStatic: true, restitution: .12, friction: .08 })
    const bodies = toolBodies.map(entry => entry.body)
    let colliderTarget: Matter.Vector | null = null
    Matter.Composite.add(engine.world, [...walls, ...toolBodies.map(entry => entry.body)])

    const state: PhysicsState = {
      engine,
      tools: toolBodies,
      walls,
      dragConstraint: null,
      draggedBody: null,
      activePointerId: null,
      width,
      height,
      frame: 0,
      lastFrame: 0,
      resizeFrame: 0,
      running: false,
      visible: false,
      lastPointerX: 0,
      lastPointerY: 0,
      lastPointerTime: 0,
      releaseVelocityX: 0,
      releaseVelocityY: 0,
    }
    physicsRef.current = state

    const allToolsSleeping = () => state.tools.every(entry => entry.body.isSleeping)
    const paint = () => state.tools.forEach(setToolTransform)

    const tick = (time: number) => {
      if (!state.running || !state.visible) {
        state.frame = 0
        return
      }
      const elapsed = Math.min(32, state.lastFrame ? time - state.lastFrame : BASE_FRAME)
      state.lastFrame = time
      if (colliderTarget) {
        const delta = Matter.Vector.sub(colliderTarget, collider.position)
        const distance = Matter.Vector.magnitude(delta)
        const point = Matter.Vector.add(collider.position, Matter.Vector.mult(delta, Math.min(1, 16 / Math.max(1, distance))))
        Matter.Body.setVelocity(collider, Matter.Vector.sub(point, collider.position))
        Matter.Body.setPosition(collider, point)
        if (distance > 1) for (const { bodyA, bodyB } of Matter.Query.collides(collider, bodies)) {
          Matter.Sleeping.set(bodyA === collider ? bodyB : bodyA, false)
        }
      }
      const steps = Math.max(1, Math.ceil(elapsed / BASE_FRAME))
      for (let step = 0; step < steps; step += 1) Matter.Engine.update(state.engine, elapsed / steps)
      paint()

      const interacting = state.activePointerId !== null
      if (!interacting && allToolsSleeping() && (!colliderTarget || Matter.Vector.magnitude(Matter.Vector.sub(colliderTarget, collider.position)) < 1)) {
        state.running = false
        state.frame = 0
        state.lastFrame = 0
        return
      }
      state.frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (state.running || !state.visible) return
      state.running = true
      state.lastFrame = 0
      state.frame = requestAnimationFrame(tick)
    }
    startRef.current = start

    const hideCollider = () => {
      colliderTarget = null
      Matter.Composite.remove(engine.world, collider)
    }
    Matter.Events.on(engine, 'collisionStart', ({ pairs }) => {
      if (pairs.some(pair => pair.bodyA === collider || pair.bodyB === collider)) tap()
    })

    const localPoint = (event: globalThis.PointerEvent) => {
      const rect = container.getBoundingClientRect()
      return {
        x: clamp(event.clientX - rect.left, 0, state.width),
        y: clamp(event.clientY - rect.top, 0, state.height),
      }
    }

    const onPointerMove = (event: globalThis.PointerEvent) => {
      if (state.activePointerId === event.pointerId && state.dragConstraint) {
        const point = localPoint(event)
        const now = performance.now()
        if (event.cancelable) event.preventDefault()
        const elapsed = Math.max(8, now - state.lastPointerTime)
        const scale = BASE_FRAME / elapsed
        state.releaseVelocityX = clamp((point.x - state.lastPointerX) * scale, -MAX_RELEASE_VELOCITY, MAX_RELEASE_VELOCITY)
        state.releaseVelocityY = clamp((point.y - state.lastPointerY) * scale, -MAX_RELEASE_VELOCITY, MAX_RELEASE_VELOCITY)
        state.dragConstraint.pointA.x = point.x
        state.dragConstraint.pointA.y = point.y
        state.lastPointerX = point.x
        state.lastPointerY = point.y
        state.lastPointerTime = now
        start()
      } else if (event.pointerType === 'mouse' && state.visible) {
        const point = localPoint(event)
        if (!colliderTarget) {
          Matter.Body.setPosition(collider, point)
          Matter.Composite.add(engine.world, collider)
        }
        colliderTarget = point
        start()
      }
    }

    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (event.button !== 0 || state.activePointerId !== null) return
      const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.home-tool-action') : null
      if (!target) return
      const toolElement = target.closest<HTMLLIElement>('.home-tool')
      const entry = state.tools.find(item => item.element === toolElement)
      if (!entry) return

      if (event.cancelable) event.preventDefault()
      hideCollider()
      tap()
      const point = localPoint(event)
      const localGrabPoint = Matter.Vector.rotate(Matter.Vector.sub(point, entry.body.position), -entry.body.angle)
      const constraint = Matter.Constraint.create({
        pointA: point,
        bodyB: entry.body,
        pointB: localGrabPoint,
        length: 0,
        stiffness: .22,
        damping: .18,
        render: { visible: false },
      })
      Matter.Sleeping.set(entry.body, false)
      Matter.Composite.add(state.engine.world, constraint)
      state.dragConstraint = constraint
      state.draggedBody = entry.body
      state.activePointerId = event.pointerId
      state.lastPointerX = point.x
      state.lastPointerY = point.y
      state.lastPointerTime = performance.now()
      state.releaseVelocityX = 0
      state.releaseVelocityY = 0
      entry.element.dataset.dragging = 'true'
      container.setPointerCapture(event.pointerId)
      start()
    }

    const releasePointer = (event: globalThis.PointerEvent) => {
      if (state.activePointerId !== event.pointerId) return
      if (state.dragConstraint) Matter.Composite.remove(state.engine.world, state.dragConstraint)
      if (state.draggedBody) {
        Matter.Body.setVelocity(state.draggedBody, {
          x: state.releaseVelocityX * .7,
          y: state.releaseVelocityY * .7,
        })
      }
      state.tools.forEach(entry => delete entry.element.dataset.dragging)
      state.dragConstraint = null
      state.draggedBody = null
      state.activePointerId = null
      if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId)
      start()
    }

    const updateBounds = () => {
      const nextWidth = container.clientWidth
      const nextHeight = container.clientHeight
      if (!nextWidth || !nextHeight) return
      const boundsChanged = nextWidth !== state.width || nextHeight !== state.height
      if (!boundsChanged && state.tools.every(({ element, width, height }) => element.offsetWidth === width && element.offsetHeight === height)) return
      const previousWidth = state.width
      const previousHeight = state.height
      if (boundsChanged) {
        Matter.Composite.remove(state.engine.world, state.walls)
        state.walls = makeWalls(nextWidth, nextHeight)
        Matter.Composite.add(state.engine.world, state.walls)
      }

      for (const entry of state.tools) {
        const nextToolWidth = entry.element.offsetWidth
        const nextToolHeight = entry.element.offsetHeight
        if (nextToolWidth !== entry.width || nextToolHeight !== entry.height) {
          Matter.Body.scale(entry.body, nextToolWidth / entry.width, nextToolHeight / entry.height)
          entry.width = nextToolWidth
          entry.height = nextToolHeight
        }
        const bottomDistance = previousHeight - entry.body.position.y
        const x = clamp(entry.body.position.x / previousWidth * nextWidth, entry.width / 2 + EDGE_INSET, nextWidth - entry.width / 2 - EDGE_INSET)
        const y = clamp(nextHeight - bottomDistance, entry.height / 2 + EDGE_INSET, nextHeight - entry.height / 2 - EDGE_INSET)
        Matter.Body.setPosition(entry.body, { x, y })
        Matter.Sleeping.set(entry.body, false)
      }
      state.width = nextWidth
      state.height = nextHeight
      paint()
      start()
    }

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(state.resizeFrame)
      state.resizeFrame = requestAnimationFrame(updateBounds)
    })
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting
      if (state.visible) start()
      else {
        hideCollider()
        state.running = false
        cancelAnimationFrame(state.frame)
        state.frame = 0
        state.lastFrame = 0
      }
    })

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointerleave', hideCollider)
    container.addEventListener('pointermove', onPointerMove, { passive: false })
    container.addEventListener('pointerup', releasePointer)
    container.addEventListener('pointercancel', releasePointer)
    container.addEventListener('lostpointercapture', releasePointer)
    resizeObserver.observe(container)
    elements.forEach(element => resizeObserver.observe(element))
    intersectionObserver.observe(container)
    paint()
    start()

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointerleave', hideCollider)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', releasePointer)
      container.removeEventListener('pointercancel', releasePointer)
      container.removeEventListener('lostpointercapture', releasePointer)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      cancelAnimationFrame(state.frame)
      cancelAnimationFrame(state.resizeFrame)
      Matter.Composite.clear(engine.world, false, true)
      Matter.Engine.clear(engine)
      elements.forEach(element => {
        element.style.removeProperty('transform')
        delete element.dataset.dragging
      })
      physicsRef.current = null
      startRef.current = null
    }
  }, [reduced])

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (!event.key.startsWith('Arrow') || reduced) return
    const state = physicsRef.current
    const entry = state?.tools[index]
    if (!state || !entry) return
    event.preventDefault()
    const strength = event.shiftKey ? .03 : .014
    const force = { x: 0, y: 0 }
    if (event.key === 'ArrowLeft') force.x = -strength
    if (event.key === 'ArrowRight') force.x = strength
    if (event.key === 'ArrowUp') force.y = -strength
    if (event.key === 'ArrowDown') force.y = strength
    Matter.Sleeping.set(entry.body, false)
    Matter.Body.applyForce(entry.body, entry.body.position, force)
    play('chip')
    startRef.current?.()
  }

  return <>
    <p className="sr-only" id="tool-cloud-instructions">Инструменты подчиняются гравитации. Нажмите на плашку и перетащите её мышью или пальцем. Для взаимодействия с клавиатуры используйте стрелки.</p>
    <ul ref={containerRef} className={`home-tool-cloud${reduced ? ' is-reduced' : ''}`} aria-label="Инструменты" aria-describedby="tool-cloud-instructions">
      {tools.map(([label, id], index) => <li className={`home-tool home-tool--${id}`} data-ai={['chatgpt', 'codex', 'claude', 'cursor'].includes(id) || undefined} key={id}>
        <button type="button" className="home-tool-action" aria-label={`${label}. Физический интерактивный инструмент`}
          aria-describedby="tool-cloud-instructions" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onKeyDown={event => onKeyDown(index, event)}>{t(label)}</button>
      </li>)}
    </ul>
  </>
}
