import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AnimatedNumber from './AnimatedNumber'
import ChartCard from './ChartCard'
import Heatmap from './Heatmap'
import Histogram from './Histogram'
import ScatterPlot from './ScatterPlot'
import TimeSeries from './TimeSeries'
import Reveal from '@/components/Reveal'
import { VARIABLES, generateDataset, generateSeries } from '@/data/dataLab'
import { histogram, linearFit, mean, median, pearson, std } from '@/utils/stats'

export default function DemoLab() {
  const { t, i18n } = useTranslation()
  const [size, setSize] = useState(300)
  const [rho, setRho] = useState(0.6)
  const [seed, setSeed] = useState(2026)
  const [showAverage, setShowAverage] = useState(true)

  const number = useMemo(() => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }), [i18n.language])
  const decimals = useMemo(
    () => new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [i18n.language],
  )

  const data = useMemo(() => generateDataset(size, rho, seed), [size, rho, seed])
  const series = useMemo(() => generateSeries(seed), [seed])

  const columns = useMemo(() => VARIABLES.map((key) => data.map((row) => row[key])), [data])
  const [a, b] = columns
  const r = pearson(a, b)
  const fit = linearFit(a, b)
  const minA = Math.min(...a)
  const maxA = Math.max(...a)
  const bins = useMemo(() => histogram(a, 12), [a])
  const points = useMemo(() => data.map((row) => ({ x: row.a, y: row.b })), [data])
  const line = [
    { x: minA, y: fit.slope * minA + fit.intercept },
    { x: maxA, y: fit.slope * maxA + fit.intercept },
  ]
  const matrix = useMemo(() => columns.map((ci) => columns.map((cj) => pearson(ci, cj))), [columns])
  const labels = VARIABLES.map((key) => t(`dataLab.vars.${key}`))
  const badge = t('dataLab.badge')

  const kpis = [
    { key: 'n', value: size, format: (v: number) => `${Math.round(v)}` },
    { key: 'mean', value: mean(a), format: number.format },
    { key: 'median', value: median(a), format: number.format },
    { key: 'std', value: std(a), format: number.format },
    { key: 'r', value: r, format: decimals.format },
  ]

  const sliderClass = 'mt-2 w-full accent-cyan-glow'

  return (
    <div>
      <Reveal>
        <p
          role="note"
          className="inline-block rounded-xl border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-2 text-sm text-ink"
        >
          {t('dataLab.notice')}
        </p>
      </Reveal>

      {/* Commandes */}
      <Reveal delay={0.05}>
        <form
          className="glass mt-6 grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          onSubmit={(event) => event.preventDefault()}
          aria-label={t('dataLab.controls.title')}
        >
          <label className="block text-sm">
            <span className="flex justify-between text-ink-soft">
              {t('dataLab.controls.size')}
              <output className="font-semibold text-cyan-glow">{size}</output>
            </span>
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className={sliderClass}
            />
          </label>

          <label className="block text-sm">
            <span className="flex justify-between text-ink-soft">
              {t('dataLab.controls.rho')}
              <output className="font-semibold text-cyan-glow">{decimals.format(rho)}</output>
            </span>
            <input
              type="range"
              min={-0.9}
              max={0.9}
              step={0.1}
              value={rho}
              onChange={(e) => setRho(Math.round(Number(e.target.value) * 10) / 10)}
              className={sliderClass}
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={showAverage}
              onChange={(e) => setShowAverage(e.target.checked)}
              className="size-4 accent-cyan-glow"
            />
            {t('dataLab.controls.average')}
          </label>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-glow/50 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-cyan-glow/10"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t('dataLab.controls.regenerate')}
          </button>
        </form>
      </Reveal>

      {/* Indicateurs dynamiques */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-live="polite">
        {kpis.map((kpi) => (
          <li key={kpi.key} className="glass p-4">
            <p className="font-display text-2xl font-bold text-cyan-glow tabular-nums">
              <AnimatedNumber value={kpi.value} format={kpi.format} />
            </p>
            <p className="mt-1 text-xs text-ink-soft">{t(`dataLab.kpis.${kpi.key}`)}</p>
          </li>
        ))}
      </ul>

      {/* Graphiques */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title={t('dataLab.charts.histogram.title')} description={t('dataLab.charts.histogram.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.charts.histogram.aria', { n: size, mean: number.format(mean(a)) })}>
            <Histogram bins={bins} countLabel={t('dataLab.charts.histogram.count')} />
          </div>
        </ChartCard>

        <ChartCard title={t('dataLab.charts.scatter.title')} description={t('dataLab.charts.scatter.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.charts.scatter.aria', { r: decimals.format(r) })}>
            <ScatterPlot points={points} line={line} xLabel={labels[0]} yLabel={labels[1]} />
          </div>
        </ChartCard>

        <ChartCard title={t('dataLab.charts.series.title')} description={t('dataLab.charts.series.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.charts.series.aria')}>
            <TimeSeries
              data={series}
              showAverage={showAverage}
              valueLabel={t('dataLab.charts.series.value')}
              averageLabel={t('dataLab.charts.series.average')}
            />
          </div>
        </ChartCard>

        <ChartCard title={t('dataLab.charts.heatmap.title')} description={t('dataLab.charts.heatmap.desc')} badge={badge}>
          <Heatmap labels={labels} matrix={matrix} caption={t('dataLab.charts.heatmap.title')} />
          <p className="mt-3 text-center text-xs text-ink-soft">{t('dataLab.charts.heatmap.legend')}</p>
        </ChartCard>
      </div>
    </div>
  )
}
