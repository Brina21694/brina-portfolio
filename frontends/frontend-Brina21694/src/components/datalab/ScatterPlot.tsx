import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors, tooltipStyle } from './chartTheme'

interface Point {
  x: number
  y: number
}

interface ScatterPlotProps {
  points: Point[]
  line: Point[]
  xLabel: string
  yLabel: string
}

export default function ScatterPlot({ points, line, xLabel, yLabel }: ScatterPlotProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 8, right: 12, left: -8, bottom: 14 }}>
        <CartesianGrid stroke={chartColors.grid} />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          domain={['auto', 'auto']}
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          tickFormatter={(v: number) => `${Math.round(v)}`}
          label={{ value: xLabel, position: 'insideBottom', offset: -8, fill: chartColors.text, fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          domain={['auto', 'auto']}
          tick={{ fill: chartColors.text, fontSize: 11 }}
          stroke={chartColors.grid}
          tickFormatter={(v: number) => `${Math.round(v)}`}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: chartColors.cyan }}
          contentStyle={tooltipStyle}
          formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)}
        />
        <Scatter data={points} fill={chartColors.cyan} fillOpacity={0.55} isAnimationActive={false} />
        <Scatter
          data={line}
          line={{ stroke: chartColors.white, strokeWidth: 2 }}
          shape={() => <g />}
          legendType="none"
          isAnimationActive={false}
          tooltipType="none"
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
