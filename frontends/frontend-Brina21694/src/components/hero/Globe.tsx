import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useOnScreen } from '@/hooks/useOnScreen'

const CYAN = '34, 229, 255'
const BLUE = '47, 107, 255'

type Vec = [number, number, number]

// Points répartis uniformément sur la sphère (spirale de Fibonacci)
function fibonacciSphere(count: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = golden * i
    return [Math.cos(theta) * radius, y, Math.sin(theta) * radius]
  })
}

function rotate([x, y, z]: Vec, angle: number, tilt: number): Vec {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const x1 = x * cosA + z * sinA
  const z1 = -x * sinA + z * cosA
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  return [x1, y * cosT - z1 * sinT, y * sinT + z1 * cosT]
}

// Globe numérique lumineux : sphère de points, méridiens, arcs de données animés.
export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const visible = useOnScreen(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dots = fibonacciSphere(520)
    const hubs = fibonacciSphere(14).map((p) => rotate(p, 0.4, 0))
    const arcs = hubs.map((_, i) => [i, (i * 5 + 3) % hubs.length] as const)
    const tilt = 0.38
    let size = 0
    let angle = 0
    let frame = 0
    // Interaction : on peut faire tourner le globe à la souris ou au doigt (glisser)
    let dragging = false
    let hovering = false
    let lastX = 0
    let velocity = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = canvas.clientWidth
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time: number) => {
      const c = size / 2
      const R = size * 0.36
      ctx.clearRect(0, 0, size, size)

      // Halo
      const halo = ctx.createRadialGradient(c, c, R * 0.6, c, c, R * 1.45)
      halo.addColorStop(0, `rgba(${BLUE}, 0.28)`)
      halo.addColorStop(1, `rgba(${BLUE}, 0)`)
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, size, size)

      // Corps de la sphère
      const body = ctx.createRadialGradient(c - R * 0.3, c - R * 0.3, R * 0.1, c, c, R)
      body.addColorStop(0, 'rgba(20, 60, 140, 0.55)')
      body.addColorStop(1, 'rgba(5, 15, 45, 0.85)')
      ctx.beginPath()
      ctx.arc(c, c, R, 0, Math.PI * 2)
      ctx.fillStyle = body
      ctx.fill()
      ctx.strokeStyle = `rgba(${CYAN}, 0.55)`
      ctx.lineWidth = 1.2
      ctx.shadowColor = '#22e5ff'
      ctx.shadowBlur = 18
      ctx.stroke()
      ctx.shadowBlur = 0

      // Méridiens et parallèles
      ctx.lineWidth = 0.6
      ctx.strokeStyle = `rgba(${CYAN}, 0.16)`
      for (let m = 0; m < 6; m++) {
        const a = angle + (m * Math.PI) / 6
        ctx.beginPath()
        ctx.ellipse(c, c, Math.abs(Math.cos(a)) * R, R, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      for (let l = -2; l <= 2; l++) {
        const y = (l / 3) * R
        const w = Math.sqrt(R * R - y * y)
        ctx.beginPath()
        ctx.ellipse(c, c + y, w, w * Math.sin(tilt), 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Points (face avant plus lumineuse)
      for (const d of dots) {
        const [x, y, z] = rotate(d, angle, tilt)
        const front = z > 0
        ctx.beginPath()
        ctx.arc(c + x * R, c + y * R, front ? 1.5 : 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${CYAN}, ${front ? 0.35 + z * 0.55 : 0.1})`
        ctx.fill()
      }

      // Arcs de données entre villes
      const pulse = (time / 2400) % 1
      arcs.forEach(([from, to], i) => {
        const a = rotate(hubs[from], angle, tilt)
        const b = rotate(hubs[to], angle, tilt)
        if (a[2] < -0.1 && b[2] < -0.1) return
        const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
        const len = Math.hypot(...mid) || 1
        const lift = 1.35
        const cx = c + (mid[0] / len) * R * lift
        const cy = c + (mid[1] / len) * R * lift
        const ax = c + a[0] * R
        const ay = c + a[1] * R
        const bx = c + b[0] * R
        const by = c + b[1] * R
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(cx, cy, bx, by)
        ctx.strokeStyle = `rgba(${CYAN}, 0.3)`
        ctx.lineWidth = 1
        ctx.stroke()

        // Petite lumière qui voyage le long de l'arc
        const t = (pulse + i * 0.13) % 1
        const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx
        const py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by
        ctx.beginPath()
        ctx.arc(px, py, 2.4, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#22e5ff'
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Villes (hubs)
      for (const h of hubs) {
        const [x, y, z] = rotate(h, angle, tilt)
        if (z < 0) continue
        ctx.beginPath()
        ctx.arc(c + x * R, c + y * R, 3.2, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#22e5ff'
        ctx.shadowBlur = 14
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    const loop = (time: number) => {
      if (visible.current) {
        if (!dragging) {
          velocity *= 0.95 // l'élan du glissement s'estompe doucement
          angle += (hovering ? 0.0055 : 0.0032) + velocity
        }
        draw(time)
      }
      frame = requestAnimationFrame(loop)
    }

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      lastX = event.clientX
      velocity = dx * 0.0016
      angle += dx * 0.008
      if (reduced) draw(0)
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      canvas.style.cursor = 'grab'
    }
    const onEnter = () => (hovering = true)
    const onLeave = () => (hovering = false)

    resize()
    draw(0)
    if (!reduced) frame = requestAnimationFrame(loop)

    window.addEventListener('resize', resize)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced, visible])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="aspect-square w-full cursor-grab"
      style={{ touchAction: 'pan-y' }}
    />
  )
}
