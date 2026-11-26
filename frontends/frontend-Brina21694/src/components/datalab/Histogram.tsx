import { useReducedMotion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Bin } from '@/utils/stats'
import { chartColors, tooltipStyle } from './chartTheme'

interface HistogramProps {
  bins: Bin[]
  countLabel: string
  height?: number
}

export default function Histogram({ bins, countLabel, height = 260 }: HistogramProps) {
  const reduced = useReducedMotion()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bins} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="hist-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={chartColors.cyan} />
            <stop offset="1" stopColor={chartColors.electric} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: chartColors.text, fontSize: 11 }} stroke={chartColors.grid} />
        <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} stroke={chartColors.grid} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(34,229,255,0.08)' }}
          formatter={(value) => [value, countLabel]}
        />
        <Bar dataKey="count" fill="url(#hist-fill)" radius={[4, 4, 0, 0]} isAnimationActive={!reduced} />
      </BarChart>
    </ResponsiveContainer>
  )
}
