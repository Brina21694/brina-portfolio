import { useReducedMotion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NamedValue } from '@/data/salaryStats'
import { chartColors, tooltipStyle } from './chartTheme'

interface LineTrendProps {
  data: NamedValue[]
  format: (value: number) => string
  tickFormat: (value: number) => string
  referenceValue?: number
  referenceLabel?: string
  valueLabel: string
  xLabel: string
}

export default function LineTrend({ data, format, tickFormat, referenceValue, referenceLabel, valueLabel, xLabel }: LineTrendProps) {
  const reduced = useReducedMotion()
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 14 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          interval={2}
          label={{ value: xLabel, position: 'insideBottom', offset: -8, fill: chartColors.text, fontSize: 11 }}
        />
        <YAxis
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          tickFormatter={tickFormat}
          domain={['auto', 'auto']}
          width={48}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [typeof value === 'number' ? format(value) : value, valueLabel]} />
        {referenceValue !== undefined && (
          <ReferenceLine
            y={referenceValue}
            stroke={chartColors.white}
            strokeDasharray="4 4"
            label={{ value: referenceLabel, fill: chartColors.text, fontSize: 10, position: 'insideBottomRight' }}
          />
        )}
        <Line
          dataKey="value"
          stroke={chartColors.cyan}
          strokeWidth={2.5}
          dot={{ r: 3, fill: chartColors.cyan }}
          activeDot={{ r: 5 }}
          isAnimationActive={!reduced}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
