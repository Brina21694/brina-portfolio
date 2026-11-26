import { motion, useReducedMotion } from 'framer-motion'

// Flux de données : lignes lumineuses qui défilent derrière le globe (voir .data-flow dans index.css).
const FLOWS = [
  'M -50 520 C 250 420, 450 640, 800 380 S 1250 300, 1500 120',
  'M -50 260 C 200 330, 520 90, 820 250 S 1220 520, 1500 430',
  'M 100 700 C 380 560, 620 700, 940 560 S 1300 650, 1500 560',
  'M -50 120 C 300 40, 600 200, 900 90 S 1300 60, 1500 200',
]

export default function DataFlows() {
  const reduced = useReducedMotion()
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.75 }}
      transition={{ duration: 1.6 }}
    >
      <defs>
        <linearGradient id="flow-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2f6bff" />
          <stop offset="1" stopColor="#22e5ff" />
        </linearGradient>
      </defs>
      {FLOWS.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(47,107,255,0.2)" strokeWidth="1" />
          {/* Deux « paquets » de lumière à des vitesses différentes */}
          {[0, 1].map((layer) => (
            <path
              key={layer}
              d={d}
              fill="none"
              stroke="url(#flow-gradient)"
              strokeWidth={layer === 0 ? 1.8 : 1.1}
              strokeLinecap="round"
              strokeDasharray={layer === 0 ? '6 190' : '3 120'}
              className={reduced ? '' : 'data-flow'}
              style={{
                animationDelay: `${i * -2.2 - layer * 3}s`,
                animationDuration: `${(7 + i * 2) * (layer === 0 ? 1 : 1.5)}s`,
              }}
            />
          ))}
        </g>
      ))}
    </motion.svg>
  )
}
