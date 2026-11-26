import { createRng, gaussian } from '@/utils/random'

// DONNÉES FICTIVES : générées par le programme, uniquement pour la démonstration du Data Lab.
// Elles ne représentent aucune situation réelle.
export const VARIABLES = ['a', 'b', 'c', 'd'] as const
export type VariableKey = (typeof VARIABLES)[number]

export type Row = Record<VariableKey, number>

// B est liée à A selon `rho` ; C varie à l'opposé de A ; D suit un peu B.
export function generateDataset(size: number, rho: number, seed: number): Row[] {
  const rng = createRng(seed)
  return Array.from({ length: size }, () => {
    const za = gaussian(rng)
    const zb = rho * za + Math.sqrt(1 - rho * rho) * gaussian(rng)
    const zc = -0.6 * za + 0.8 * gaussian(rng)
    const zd = 0.5 * zb + Math.sqrt(0.75) * gaussian(rng)
    return { a: 50 + 10 * za, b: 60 + 12 * zb, c: 30 + 8 * zc, d: 100 + 15 * zd }
  })
}

export interface MonthPoint {
  month: number
  value: number
  average: number | null
}

// Série temporelle fictive de 24 mois : tendance + saisonnalité + bruit, avec moyenne mobile sur 3 mois.
export function generateSeries(seed: number): MonthPoint[] {
  const rng = createRng(seed + 7)
  const values = Array.from({ length: 24 }, (_, i) => 100 + 2.2 * i + 9 * Math.sin((i / 12) * 2 * Math.PI) + 4 * gaussian(rng))
  return values.map((value, i) => ({
    month: i + 1,
    value: Math.round(value * 10) / 10,
    average: i < 2 ? null : Math.round(((values[i] + values[i - 1] + values[i - 2]) / 3) * 10) / 10,
  }))
}
