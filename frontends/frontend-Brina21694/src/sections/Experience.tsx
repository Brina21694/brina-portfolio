import { Briefcase, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ApiState from '@/components/ApiState'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useApi } from '@/hooks/useApi'
import { formatPeriod } from '@/lib/format'
import { api } from '@/services/api'

interface Step {
  key: string
  kind: 'education' | 'experience'
  title: string
  place: string
  debut: string
  fin: string | null
  description?: string | null
}

const sameCity = (a: string | null | undefined, b: string) => (a ?? '').trim().toLowerCase() === b.trim().toLowerCase()

export default function Experience() {
  const { t, i18n } = useTranslation()
  const [city, setCity] = useState<string | null>(null)
  const profil = useApi(() => api.getProfil())
  // R8 : expériences filtrées par ville. Si l'appel échoue, on retombe sur celles du profil.
  const exps = useApi((signal) => api.getExperiences(city ?? undefined, signal), [city ?? ''])

  const p = profil.data
  const experiences = exps.data?.items ?? (exps.error ? (p?.experiences ?? []).filter((e) => !city || sameCity(e.lieu, city)) : [])
  const formations = (p?.formations ?? []).filter((f) => !city || sameCity(f.lieu, city))

  const cities = [...new Set([...(p?.experiences ?? []).map((e) => e.lieu), ...(p?.formations ?? []).map((f) => f.lieu ?? '')])].filter(Boolean)

  const steps: Step[] = [
    ...formations.map<Step>((f) => ({
      key: `f-${f.ecole}-${f.debut}`,
      kind: 'education',
      title: f.diplome,
      place: [f.ecole, f.lieu].filter(Boolean).join(', '),
      debut: f.debut,
      fin: f.fin,
    })),
    ...experiences.map<Step>((e) => ({
      key: `e-${e.entreprise}-${e.debut}`,
      kind: 'experience',
      title: e.poste,
      place: [e.entreprise, e.lieu].filter(Boolean).join(', '),
      debut: e.debut,
      fin: e.fin,
      description: e.description,
    })),
  ].sort((a, b) => a.debut.localeCompare(b.debut))

  return (
    <Section id="experience" title={t('nav.experience')} eyebrow={t('parcours.eyebrow')}>
      <Reveal>
        <p className="mt-6 max-w-2xl text-ink-soft">{t('parcours.intro')}</p>
      </Reveal>

      <ApiState loading={profil.loading} error={profil.error} retry={profil.retry} />

      {cities.length > 1 && (
        <div className="mt-8" role="group" aria-label={t('parcours.cityLabel')}>
          <ul className="flex flex-wrap gap-2">
            {[null, ...cities].map((c) => (
              <li key={c ?? 'all'}>
                <button
                  type="button"
                  aria-pressed={city === c}
                  onClick={() => setCity(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    city === c
                      ? 'border-cyan-glow bg-cyan-glow/15 text-cyan-glow'
                      : 'border-cyan-glow/30 hover:border-cyan-glow hover:text-cyan-glow'
                  }`}
                >
                  {c ?? t('parcours.allCities')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="relative mt-10 space-y-8 border-l border-cyan-glow/25 pl-8 sm:pl-10" aria-busy={profil.loading}>
        {steps.map((step, i) => {
          const Icon = step.kind === 'education' ? GraduationCap : Briefcase
          return (
            <li key={step.key} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[2.85rem] top-5 grid size-6 place-items-center rounded-full border border-cyan-glow bg-night sm:-left-[3.35rem]"
              >
                {step.fin === null && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-glow/40 motion-reduce:animate-none" />
                )}
                <span className="relative size-2.5 rounded-full bg-cyan-glow shadow-glow" />
              </span>

              <Reveal delay={i * 0.05}>
                <article className="glass p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-glow/10 px-3 py-1 font-semibold text-cyan-glow">
                      <Icon aria-hidden="true" className="size-4" />
                      {t(`parcours.kinds.${step.kind}`)}
                    </span>
                    <span className="text-ink-soft">{formatPeriod(step.debut, step.fin, i18n.language, t('api.present'))}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{step.title}</h3>
                  <p className="mt-1 text-sm font-medium text-cyan-glow">{step.place}</p>
                  {step.description && <p className="mt-3 leading-relaxed text-ink-soft">{step.description}</p>}
                </article>
              </Reveal>
            </li>
          )
        })}
      </ol>

      <Reveal delay={0.1}>
        <div className="mt-12">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">{t('parcours.languagesTitle')}</h3>
          <ul className="mt-3 flex flex-wrap gap-3">
            {(['french', 'english'] as const).map((lang) => (
              <li key={lang} className="glass px-5 py-3 text-sm">
                <span className="font-semibold">{t(`parcours.languages.${lang}.name`)}</span>
                <span className="text-ink-soft"> · {t(`parcours.languages.${lang}.level`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  )
}
