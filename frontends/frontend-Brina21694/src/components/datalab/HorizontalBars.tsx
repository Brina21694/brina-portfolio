import { useReducedMotion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NamedValue } from '@/data/salaryStats'
import { chartColors, tooltipStyle } from './chartTheme'

interface HorizontalBarsProps {
  data: NamedValue[]
  format: (value: number) => string
  tickFormat?: (value: number) => string
  /** Les barres au-dessus de ce seuil sont en cyan, les autres en bleu électrique. */
  highlightAbove?: number
  /** Trait vertical de référence (par exemple la moyenne globale). */
  referenceValue?: number
  referenceLabel?: string
  valueLabel: string
}

export default function HorizontalBars({
  data,
  format,
  tickFormat,
  highlightAbove,
  referenceValue,
  referenceLabel,
  valueLabel,
}: HorizontalBarsProps) {
  const reduced = useReducedMotion()
  const height = Math.max(200, data.length * 30 + 30)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          tickFormatter={tickFormat}
          domain={[0, 'auto']}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={128}
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(34,229,255,0.08)' }}
          formatter={(value) => [typeof value === 'number' ? format(value) : value, valueLabel]}
        />
        {referenceValue !== undefined && (
          <ReferenceLine
            x={referenceValue}
            stroke={chartColors.white}
            strokeDasharray="4 4"
            label={{ value: referenceLabel, fill: chartColors.text, fontSize: 10, position: 'insideTopRight' }}
          />
        )}
        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={!reduced}>
          {data.map((item) => (
            <Cell
              key={item.name}
              fill={highlightAbove !== undefined && item.value >= highlightAbove ? chartColors.cyan : chartColors.electric}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
