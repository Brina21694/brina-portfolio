import { useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Reveal from '@/components/Reveal'
import { DIMENSIONS, FEATURE_IMPORTANCE, MODEL_RESULTS, SALARY_STATS } from '@/data/salaryStats'
import type { Dimension } from '@/data/salaryStats'
import ChartCard from './ChartCard'
import { chartColors, tooltipStyle } from './chartTheme'
import Histogram from './Histogram'
import HorizontalBars from './HorizontalBars'
import LineTrend from './LineTrend'

// Résultats RÉELS du projet « Prédiction des salaires » (voir data/salaryStats.ts).
export default function RealLab() {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion()
  const [dimension, setDimension] = useState<Dimension>('job_title')

  const money = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }),
    [i18n.language],
  )
  const integer = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language])
  const decimal = useMemo(
    () => new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [i18n.language],
  )
  const kFormat = (v: number) => `${Math.round(v / 1000)}k`
  const badge = t('dataLab.real.badge')
  const stats = SALARY_STATS
  // Poste et pays : du plus élevé au plus bas (la plus grande barre en haut). Les autres critères gardent leur ordre naturel.
  const dimensionData =
    dimension === 'job_title' || dimension === 'location'
      ? [...stats.byDimension[dimension]].reverse()
      : stats.byDimension[dimension]
  const bestR2 = Math.max(...MODEL_RESULTS.map((m) => m.r2))

  const kpis = [
    { key: 'rows', value: integer.format(stats.rows) },
    { key: 'mean', value: money.format(stats.mean) },
    { key: 'median', value: money.format(stats.median) },
    { key: 'corr', value: decimal.format(stats.corrExperience) },
  ]

  const features = FEATURE_IMPORTANCE.map((f) => ({ name: t(`dataLab.real.features.${f.name}`), value: f.value }))
  const models = MODEL_RESULTS.map((m) => ({ ...m, label: t(`dataLab.real.models.names.${m.name}`) }))

  return (
    <div>
      <Reveal>
        <p role="note" className="inline-block rounded-xl border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-2 text-sm text-ink">
          {t('dataLab.real.notice')}
        </p>
      </Reveal>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <li key={kpi.key} className="glass p-4">
            <p className="font-display text-2xl font-bold text-cyan-glow tabular-nums">{kpi.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{t(`dataLab.real.kpis.${kpi.key}`)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title={t('dataLab.real.distribution.title')} description={t('dataLab.real.distribution.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.real.distribution.aria', { mean: money.format(stats.mean) })}>
            <Histogram bins={stats.histogram} countLabel={t('dataLab.real.distribution.count')} height={400} />
          </div>
        </ChartCard>

        <ChartCard title={t('dataLab.real.explore.title')} description={t('dataLab.real.explore.desc')} badge={badge}>
          <div role="group" aria-label={t('dataLab.real.explore.selector')} className="mb-4 flex flex-wrap gap-2">
            {DIMENSIONS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={dimension === d}
                onClick={() => setDimension(d)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  dimension === d
                    ? 'border-cyan-glow bg-cyan-glow text-void'
                    : 'border-cyan-glow/30 text-ink-soft hover:border-cyan-glow hover:text-ink'
                }`}
              >
                {t(`dataLab.real.dimensions.${d}`)}
              </button>
            ))}
          </div>
          <div
            role="img"
            aria-label={t('dataLab.real.explore.aria', { dimension: t(`dataLab.real.dimensions.${dimension}`) })}
          >
            {dimension === 'experience_years' ? (
              <LineTrend
                data={dimensionData}
                format={money.format}
                tickFormat={kFormat}
                referenceValue={stats.mean}
                referenceLabel={t('dataLab.real.explore.meanLine')}
                valueLabel={t('dataLab.real.explore.value')}
                xLabel={t('dataLab.real.explore.years')}
              />
            ) : (
              <HorizontalBars
                data={dimensionData}
                format={money.format}
                tickFormat={kFormat}
                highlightAbove={stats.mean}
                referenceValue={stats.mean}
                referenceLabel={t('dataLab.real.explore.meanLine')}
                valueLabel={t('dataLab.real.explore.value')}
              />
            )}
          </div>
        </ChartCard>

        <ChartCard title={t('dataLab.real.models.title')} description={t('dataLab.real.models.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.real.models.aria')}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={models} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartColors.text, fontSize: 11 }} stroke={chartColors.grid} />
                <YAxis domain={[0, 1]} tick={{ fill: chartColors.text, fontSize: 11 }} stroke={chartColors.grid} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,229,255,0.08)' }} />
                <Bar dataKey="r2" name="R²" radius={[4, 4, 0, 0]} isAnimationActive={!reduced}>
                  {models.map((m) => (
                    <Cell key={m.name} fill={m.r2 === bestR2 ? chartColors.cyan : chartColors.electric} />
                  ))}
                  <LabelList dataKey="r2" position="top" fill="#ffffff" fontSize={12} formatter={(v) => (typeof v === 'number' ? decimal.format(v) : v)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="mt-4 w-full text-left text-xs">
            <caption className="sr-only">{t('dataLab.real.models.title')}</caption>
            <thead className="text-ink-soft">
              <tr>
                <th scope="col" className="py-1 font-medium">{t('dataLab.real.models.model')}</th>
                <th scope="col" className="py-1 text-right font-medium">R²</th>
                <th scope="col" className="py-1 text-right font-medium">MAE</th>
                <th scope="col" className="py-1 text-right font-medium">RMSE</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} className="border-t border-ink-soft/15">
                  <th scope="row" className="py-1.5 font-medium">{m.label}</th>
                  <td className="py-1.5 text-right tabular-nums">{decimal.format(m.r2)}</td>
                  <td className="py-1.5 text-right tabular-nums">{money.format(m.mae)}</td>
                  <td className="py-1.5 text-right tabular-nums">{money.format(m.rmse)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-soft">{t('dataLab.real.models.note')}</p>
        </ChartCard>

        <ChartCard title={t('dataLab.real.importance.title')} description={t('dataLab.real.importance.desc')} badge={badge}>
          <div role="img" aria-label={t('dataLab.real.importance.aria')}>
            <HorizontalBars
              data={[...features].reverse()}
              format={(v) => `${v.toFixed(1)} %`}
              tickFormat={(v) => `${v} %`}
              highlightAbove={15}
              valueLabel={t('dataLab.real.importance.value')}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
