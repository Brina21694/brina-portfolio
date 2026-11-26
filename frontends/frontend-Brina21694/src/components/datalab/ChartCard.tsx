import type { ReactNode } from 'react'
import Reveal from '@/components/Reveal'

interface ChartCardProps {
  title: string
  description: string
  badge: string
  className?: string
  children: ReactNode
}

// Cadre commun des graphiques du Data Lab, avec l'étiquette « données fictives ».
export default function ChartCard({ title, description, badge, className = '', children }: ChartCardProps) {
  return (
    <Reveal className={`h-full ${className}`}>
      <article className="glass flex h-full flex-col p-5 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/50 hover:shadow-glow sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <span className="rounded-full border border-ink-soft/25 px-2.5 py-0.5 text-[11px] text-ink-soft">{badge}</span>
        </header>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
        <div className="mt-4 flex-1">{children}</div>
      </article>
    </Reveal>
  )
}
