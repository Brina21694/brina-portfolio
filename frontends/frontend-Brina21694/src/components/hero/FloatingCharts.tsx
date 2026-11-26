import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

// Les valeurs de ces mini-graphiques sont purement décoratives (illustration), pas des résultats réels.
const BARS = [38, 62, 48, 80, 58, 92, 70]
const POINTS: [number, number][] = [
  [0, 38], [14, 30], [28, 34], [42, 20], [56, 24], [70, 10], [84, 14], [100, 4],
]
const LINE = POINTS.map(([x, y]) => `${x},${y}`).join(' ')
const DONUT = 94.2

interface FloatProps {
  className: string
  delay: number
  duration: number
  title: string
  caption?: string
  onHover?: (hovering: boolean) => void
  children: ReactNode
}

// Carte en verre qui flotte doucement ; au survol elle grossit et s'illumine.
function Float({ className, delay, duration, title, caption, onHover, children }: FloatProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={`glass absolute p-3 shadow-glow transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/70 hover:shadow-[0_0_40px_rgba(34,229,255,0.35)] ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -12, 0] }}
      whileHover={reduced ? undefined : { scale: 1.07, zIndex: 20 }}
      onHoverStart={() => onHover?.(true)}
      onHoverEnd={() => onHover?.(false)}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.35, delay: 0 },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      <p className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-ink-soft">
        <span>{title}</span>
        <span className="font-semibold normal-case tracking-normal text-cyan-glow">{caption}</span>
      </p>
      {children}
    </motion.div>
  )
}

export default function FloatingCharts() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  // Animations réduites : les graphiques apparaissent directement, sans se dessiner
  const s = reduced ? 0 : 1
  const [bar, setBar] = useState<number | null>(null)
  const [point, setPoint] = useState<number | null>(null)
  const [donutHover, setDonutHover] = useState(false)

  const onLineMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    setPoint(Math.min(POINTS.length - 1, Math.max(0, Math.round(ratio * (POINTS.length - 1)))))
  }

  return (
    <>
      <Float
        className="left-0 top-[12%] w-32 sm:w-40"
        delay={0.6}
        duration={6}
        title={t('hero.chartBars')}
        caption={bar !== null ? `${BARS[bar]}` : undefined}
        onHover={(h) => !h && setBar(null)}
      >
        <div className="flex h-14 items-end gap-1">
          {BARS.map((h, i) => (
            <motion.span
              key={i}
              onPointerEnter={() => setBar(i)}
              className="flex-1 rounded-sm bg-gradient-to-t from-electric to-cyan-glow transition-[filter,opacity] duration-200"
              style={{ opacity: bar === null || bar === i ? 1 : 0.45, filter: bar === i ? 'brightness(1.4)' : 'none' }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.9 * s, delay: (0.9 + i * 0.07) * s }}
            />
          ))}
        </div>
      </Float>

      <Float
        className="right-0 top-[30%] w-36 sm:w-44"
        delay={0.9}
        duration={7}
        title={t('hero.chartTrend')}
        caption={point !== null ? `${44 - POINTS[point][1]}` : undefined}
        onHover={(h) => !h && setPoint(null)}
      >
        <svg
          viewBox="0 0 100 44"
          className="h-12 w-full touch-none overflow-visible"
          onPointerMove={onLineMove}
        >
          <motion.polyline
            points={LINE}
            fill="none"
            stroke="#22e5ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6 * s, delay: 1.2 * s }}
          />
          {point !== null && (
            <>
              <line x1={POINTS[point][0]} x2={POINTS[point][0]} y1="0" y2="44" stroke="rgba(34,229,255,0.35)" strokeWidth="0.8" />
              <circle cx={POINTS[point][0]} cy={POINTS[point][1]} r="3" fill="#ffffff" stroke="#22e5ff" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </Float>

      <Float
        className="bottom-[8%] left-[6%] w-28 sm:w-36"
        delay={1.2}
        duration={8}
        title={t('hero.chartShare')}
        caption={donutHover ? '68 %' : undefined}
        onHover={setDonutHover}
      >
        <svg viewBox="0 0 42 42" className="mx-auto size-14 -rotate-90">
          <circle cx="21" cy="21" r="15" fill="none" stroke="rgba(185,199,230,0.2)" strokeWidth="5" />
          <motion.circle
            cx="21"
            cy="21"
            r="15"
            fill="none"
            stroke={donutHover ? '#22e5ff' : '#2f6bff'}
            strokeLinecap="round"
            initial={{ strokeDashoffset: DONUT, strokeWidth: 5 }}
            animate={{ strokeDashoffset: DONUT * 0.32, strokeWidth: donutHover ? 7 : 5 }}
            strokeDasharray={DONUT}
            transition={{ strokeDashoffset: { duration: 1.4 * s, delay: 1.5 * s }, strokeWidth: { duration: 0.3 } }}
          />
        </svg>
      </Float>
    </>
  )
}
