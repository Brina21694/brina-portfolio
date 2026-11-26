import { LayoutDashboard, Search, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Les 3 idées de la section Vision. Les textes sont dans translations/ (vision.principles.<key>).
export const PRINCIPLES: { key: 'understand' | 'clarify' | 'grow'; icon: LucideIcon }[] = [
  { key: 'understand', icon: Search },
  { key: 'clarify', icon: LayoutDashboard },
  { key: 'grow', icon: TrendingUp },
]

// Qualités citées sur le CV de Brina
export const QUALITIES = ['team', 'relational', 'curious', 'rigour'] as const
