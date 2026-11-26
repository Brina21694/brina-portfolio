import { useReducedMotion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '@/data/dataLab'
import { chartColors, tooltipStyle } from './chartTheme'

interface TimeSeriesProps {
  data: MonthPoint[]
  showAverage: boolean
  valueLabel: string
  averageLabel: string
}

export default function TimeSeries({ data, showAverage, valueLabel, averageLabel }: TimeSeriesProps) {
  const reduced = useReducedMotion()
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          tickFormatter={(m: number) => `M${m}`}
          interval={3}
        />
        <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} stroke={chartColors.grid} domain={['auto', 'auto']} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(m) => `M${m}`} />
        <Line
          name={valueLabel}
          dataKey="value"
          stroke={chartColors.cyan}
          strokeWidth={2}
          dot={{ r: 2.5, fill: chartColors.cyan }}
          activeDot={{ r: 5 }}
          isAnimationActive={!reduced}
        />
        {showAverage && (
          <Line
            name={averageLabel}
            dataKey="average"
            stroke={chartColors.electric}
            strokeWidth={3}
            dot={false}
            connectNulls
            isAnimationActive={!reduced}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
