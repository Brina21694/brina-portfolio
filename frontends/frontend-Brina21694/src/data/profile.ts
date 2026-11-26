import { BarChart3, Database, LayoutDashboard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Les 3 domaines mis en avant dans « À propos ». Les textes sont dans translations/.
// Plus tard, ces informations pourront venir de l'API de l'équipe (route /api/candidats/{slug}).
export const PILLARS: { key: 'analysis' | 'bigData' | 'bi'; icon: LucideIcon }[] = [
  { key: 'analysis', icon: BarChart3 },
  { key: 'bigData', icon: Database },
  { key: 'bi', icon: LayoutDashboard },
]

export const FACT_KEYS = ['education', 'prepa', 'location', 'goal'] as const
