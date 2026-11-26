import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import DemoLab from '@/components/datalab/DemoLab'
import RealLab from '@/components/datalab/RealLab'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'

const TABS = ['real', 'demo'] as const
type Tab = (typeof TABS)[number]

export default function DataLab() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('real')
  const baseId = useId()

  // Navigation clavier des onglets : flèches gauche / droite
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next: Tab = tab === 'real' ? 'demo' : 'real'
    setTab(next)
    document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }

  return (
    <Section id="data-lab" title={t('nav.dataLab')} eyebrow={t('dataLab.eyebrow')}>
      <Reveal>
        <p className="mt-6 max-w-2xl text-ink-soft">{t('dataLab.intro')}</p>
      </Reveal>

      <div role="tablist" aria-label={t('dataLab.tabs.label')} className="mt-8 inline-flex rounded-full border border-ink-soft/25 p-1">
        {TABS.map((id) => (
          <button
            key={id}
            id={`${baseId}-tab-${id}`}
            role="tab"
            type="button"
            aria-selected={tab === id}
            aria-controls={`${baseId}-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={onKeyDown}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === id ? 'bg-cyan-glow text-void' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t(`dataLab.tabs.${id}`)}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${tab}`}
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="mt-6"
      >
        {tab === 'real' ? <RealLab /> : <DemoLab />}
      </div>
    </Section>
  )
}
