import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useOnScreen } from '@/hooks/useOnScreen'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  phase: number
}

const LINK_DISTANCE = 110
const POINTER_DISTANCE = 150

// Fond de particules lumineuses : scintillement, petits liens entre voisines
// et effet « constellation » autour du curseur. Statique si les animations sont réduites.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const visible = useOnScreen(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    const pointer = { x: -9999, y: -9999 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(80, Math.floor((width * height) / 15000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.06 - Math.random() * 0.2,
        r: 0.6 + Math.random() * 1.5,
        a: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }
    const onPointerLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          if (p.y < -4) p.y = height + 4
          if (p.x < -4) p.x = width + 4
          if (p.x > width + 4) p.x = -4
        }
      }

      // Liens entre particules proches
      ctx.shadowBlur = 0
      ctx.lineWidth = 0.6
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(47, 107, 255, ${(1 - dist / LINK_DISTANCE) * 0.35})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        // Constellation autour du curseur
        const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y)
        if (dp < POINTER_DISTANCE) {
          ctx.strokeStyle = `rgba(34, 229, 255, ${(1 - dp / POINTER_DISTANCE) * 0.6})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(pointer.x, pointer.y)
          ctx.stroke()
        }
      }

      // Points lumineux qui scintillent doucement
      for (const p of particles) {
        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(time / 900 + p.phase)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34, 229, 255, ${p.a * twinkle})`
        ctx.shadowColor = '#22e5ff'
        ctx.shadowBlur = 8
        ctx.fill()
      }
    }

    const loop = (time: number) => {
      if (visible.current) draw(time)
      frame = requestAnimationFrame(loop)
    }

    resize()
    draw(0)
    window.addEventListener('resize', resize)
    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove)
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
      frame = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [reduced, visible])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
}
