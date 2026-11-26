import { motion } from 'framer-motion'
import { BrainCircuit, Code2, Database, LayoutDashboard, LineChart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ApiState from '@/components/ApiState'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useApi } from '@/hooks/useApi'
import { api } from '@/services/api'
import type { DomaineCompetences } from '@/types/api'

const ICONS: Record<string, LucideIcon> = {
  langages: Code2,
  'bases-de-donnees': Database,
  'data-analysis': LineChart,
  'big-data': Database,
  'data-visualization': LayoutDashboard,
  'machine-learning': BrainCircuit,
}

const chipClass = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    on ? 'border-cyan-glow bg-cyan-glow/15 text-cyan-glow' : 'border-cyan-glow/30 text-ink hover:border-cyan-glow hover:text-cyan-glow'
  }`

export default function Skills() {
  const { t } = useTranslation()
  const stats = useApi((signal) => api.getStats(undefined, signal))
  const profil = useApi(() => api.getProfil())
  const [domain, setDomain] = useState<string | null>(null)
  // R7 : compétences d'un domaine (Neo4j). Si l'appel échoue, on filtre avec le champ « domaine » des statistiques.
  const inDomain = useApi<DomaineCompetences | null>(
    async (signal) => (domain ? api.getDomaine(domain, signal) : null),
    [domain ?? ''],
  )

  const items = stats.data?.items ?? []
  const profileOnly = (profil.data?.competences ?? []).filter((c) => !items.some((s) => s.skill_slug === c.skill_slug))
  const domains = [...new Set([...items.map((s) => s.domaine), ...profileOnly.map((c) => c.domaine)])]
  const domainName = (slug: string) => t(`skills.domains.${slug}`, { defaultValue: slug.replace(/-/g, ' ') })
  const allowed = inDomain.data ? new Set(inDomain.data.items.map((s) => s.skill_slug)) : null
  const visible = items.filter((s) => (!domain ? true : allowed ? allowed.has(s.skill_slug) : s.domaine === domain))
  const groups = domains
    .map((d) => ({
      slug: d,
      skills: [
        ...visible.filter((s) => s.domaine === d),
        ...profileOnly
          .filter((c) => c.domaine === d && (!domain || !allowed || allowed.has(c.skill_slug)))
          .map((c) => ({ skill_slug: c.skill_slug, nom: c.nom, nb_projets: 0 })),
      ],
    }))
    .filter((g) => g.skills.length > 0)
  return (
    <Section id="skills" title={t('nav.skills')} eyebrow={t('skills.eyebrow')}>
      <Reveal>
        <p className="mt-6 max-w-2xl text-ink-soft">{t('skills.intro')}</p>
      </Reveal>

      <ApiState loading={stats.loading} error={stats.error} retry={stats.retry} />

      {domains.length > 1 && (
        <div className="mt-8" role="group" aria-label={t('skills.domainsLabel')}>
          <ul className="flex flex-wrap gap-2">
            {[null, ...domains].map((d) => (
              <li key={d ?? 'all'}>
                <button type="button" aria-pressed={domain === d} onClick={() => setDomain(d)} className={chipClass(domain === d)}>
                  {d ? domainName(d) : t('skills.allDomains')}
                </button>
              </li>
            ))}
          </ul>
          {domain && <ApiState loading={false} error={inDomain.error} retry={inDomain.retry} compact />}
        </div>
      )}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {groups.map(({ slug, skills }, i) => {
          const Icon = ICONS[slug] ?? Code2
          return (
            <li key={slug}>
              <Reveal delay={i * 0.08} className="h-full">
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="glass h-full p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow/20 to-electric/30 text-cyan-glow">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{domainName(slug)}</h3>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <li
                        key={s.skill_slug}
                        title={s.nb_projets > 0 ? t('skills.usedIn', { count: s.nb_projets }) : undefined}
                        className="rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3.5 py-1.5 text-sm font-medium text-ink"
                      >
                        {s.nom}
                        {s.nb_projets > 0 && <span className="sr-only"> ({t('skills.usedIn', { count: s.nb_projets })})</span>}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              </Reveal>
            </li>
          )
        })}
      </ul>

    </Section>
  )
}
