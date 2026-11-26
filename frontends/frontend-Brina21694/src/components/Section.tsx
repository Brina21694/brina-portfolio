import type { ReactNode } from 'react'
import Reveal from '@/components/Reveal'

interface SectionProps {
  id: string
  title: string
  eyebrow?: string
  className?: string
  children?: ReactNode
}

// Conteneur commun à toutes les sections : ancre, titre accessible, largeur maximale.
// `scroll-mt-24` laisse la place du menu fixe quand on arrive sur une ancre.
export default function Section({ id, title, eyebrow, className = '', children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 px-6 py-24 sm:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-glow">{eyebrow}</p>
          )}
          <h2 id={`${id}-title`} className="font-display text-3xl font-bold sm:text-4xl">
            {title}
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-glow to-electric" aria-hidden="true" />
        </Reveal>
        {children}
      </div>
    </section>
  )
}
