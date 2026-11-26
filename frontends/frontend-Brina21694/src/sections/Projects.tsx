import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ApiState from '@/components/ApiState'
import ProjectModal from '@/components/ProjectModal'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { PROJECT_EXTRAS } from '@/data/projectExtras'
import { useApi } from '@/hooks/useApi'
import { useSkillNames } from '@/hooks/useSkillNames'
import { api } from '@/services/api'

const SIZE = 6

interface Highlight {
  value: string
  label: string
}

export default function Projects() {
  const { t, i18n } = useTranslation()
  const skillName = useSkillNames()
  const [competence, setCompetence] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)

  const list = useApi((signal) => api.getProjets({ competence: competence ?? undefined, page, size: SIZE }, signal), [competence ?? '', page])
  const stats = useApi((signal) => api.getStats(undefined, signal))

  const en = i18n.language.startsWith('en')
  const items = list.data?.items ?? []
  const pages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.size)) : 1
  const filters = stats.data?.items ?? []

  return (
    <Section id="projects" title={t('nav.projects')} eyebrow={t('projects.eyebrow')}>
      <Reveal>
        <p className="mt-6 max-w-2xl text-ink-soft">{t('projects.intro')}</p>
      </Reveal>

      {filters.length > 0 && (
        <div className="mt-8" role="group" aria-label={t('projects.filterLabel')}>
          <ul className="flex flex-wrap gap-2">
            {[null, ...filters.map((s) => s.skill_slug)].map((slug) => (
              <li key={slug ?? 'all'}>
                <button
                  type="button"
                  aria-pressed={competence === slug}
                  onClick={() => {
                    setCompetence(slug)
                    setPage(1)
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    competence === slug
                      ? 'border-cyan-glow bg-cyan-glow/15 text-cyan-glow'
                      : 'border-cyan-glow/30 hover:border-cyan-glow hover:text-cyan-glow'
                  }`}
                >
                  {slug ? skillName(slug) : t('projects.allSkills')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ApiState loading={list.loading} error={list.error} retry={list.retry} />
      {!list.loading && !list.error && items.length === 0 && <p className="mt-10 text-ink-soft">{t('projects.none')}</p>}

      <ul className="mt-8 grid gap-6 lg:grid-cols-3" aria-busy={list.loading}>
        {items.map((project, i) => {
          const extra = PROJECT_EXTRAS[project.projet_slug]
          const base = extra ? `projects.items.${extra.key}` : null
          // L'API renvoie un seul texte (français) : en anglais, on utilise la traduction locale quand elle existe.
          const title = en && base ? t(`${base}.title`) : project.titre
          const summary = en && base ? t(`${base}.summary`) : project.description
          const highlights = base ? (t(`${base}.highlights`, { returnObjects: true }) as unknown as Highlight[]) : []
          return (
            <li key={project.projet_slug}>
              <Reveal delay={i * 0.1} className="h-full">
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="glass group flex h-full flex-col p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow"
                >
                  <p className="text-sm font-semibold text-cyan-glow">{project.annee}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{summary}</p>

                  {Array.isArray(highlights) && highlights.length > 0 && (
                    <dl className="mt-5 grid grid-cols-2 gap-3">
                      {highlights.map((h) => (
                        <div key={h.label}>
                          <dd className="font-display text-xl font-bold text-cyan-glow">{h.value}</dd>
                          <dt className="text-xs text-ink-soft">{h.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}

                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {project.competences.map((s) => (
                      <li key={s} className="rounded-full border border-cyan-glow/25 px-2.5 py-0.5 text-xs text-ink-soft">
                        {skillName(s)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => setSelected(project.projet_slug)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-electric px-5 py-2 text-sm font-semibold text-void transition-transform hover:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100"
                    >
                      {t('projects.viewDetail')}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </motion.article>
              </Reveal>
            </li>
          )
        })}
      </ul>

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((n) => n - 1)}
            aria-label={t('projects.prev')}
            className="rounded-full border border-cyan-glow/40 p-2 transition-colors hover:bg-cyan-glow/10 disabled:opacity-30"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <span className="text-sm text-ink-soft">{t('projects.page', { page, pages })}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((n) => n + 1)}
            aria-label={t('projects.nextPage')}
            className="rounded-full border border-cyan-glow/40 p-2 transition-colors hover:bg-cyan-glow/10 disabled:opacity-30"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </nav>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectModal key="project-modal" slug={selected} onSelect={setSelected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </Section>
  )
}
