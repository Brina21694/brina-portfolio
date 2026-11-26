import { motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ApiState from '@/components/ApiState'
import { PROJECT_EXTRAS } from '@/data/projectExtras'
import { useApi } from '@/hooks/useApi'
import { useSkillNames } from '@/hooks/useSkillNames'
import { api } from '@/services/api'

interface Highlight {
  value: string
  label: string
}

interface ProjectModalProps {
  slug: string
  onClose: () => void
  /** Ouvre un autre projet (depuis « Projets similaires »). */
  onSelect: (slug: string) => void
}

const listFor = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : [])

// Fenêtre de détail d'un projet : accessible (rôle dialog, Échap, focus piégé, défilement de la page bloqué).
export default function ProjectModal({ slug, onClose, onSelect }: ProjectModalProps) {
  const { t, i18n } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const skillName = useSkillNames()
  // Le détail (MongoDB) et les projets similaires (Neo4j) se chargent séparément :
  // une panne du graphe n'empêche pas d'afficher le projet.
  const detail = useApi((signal) => api.getProjet(slug, signal), [slug])
  const similar = useApi((signal) => api.getSimilaires(slug, signal), [slug])
  // Un backend = un candidat : on ne propose que MES projets, même si le graphe contient ceux d'autres candidats.
  const own = useApi((signal) => api.getProjets({ size: 100 }, signal))
  const ownSlugs = new Set((own.data?.items ?? []).map((p) => p.projet_slug))
  const similarItems = (similar.data?.items ?? []).filter((s) => ownSlugs.has(s.projet_slug))
  const project = detail.data
  const extra = PROJECT_EXTRAS[slug]
  const base = extra ? `projects.items.${extra.key}` : ''
  const en = i18n.language.startsWith('en')
  const titleId = `project-title-${slug}`

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [onClose])

  const highlights = base ? (t(`${base}.highlights`, { returnObjects: true }) as unknown as Highlight[]) : []
  const objectives = base ? listFor(t(`${base}.objectives`, { returnObjects: true })) : []
  const method = base ? listFor(t(`${base}.method`, { returnObjects: true })) : []
  const results = base ? listFor(t(`${base}.results`, { returnObjects: true })) : []
  const imageAlts = base ? listFor(t(`${base}.images`, { returnObjects: true })) : []
  const hasLimits = base !== '' && i18n.exists(`${base}.limits`)

  const sectionTitle = 'text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow'

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-cyan-glow/25 bg-night p-6 shadow-glow sm:rounded-2xl sm:p-8"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('projects.close')}
          className="absolute right-4 top-4 rounded-full border border-ink-soft/25 p-2 text-ink-soft transition-colors hover:border-cyan-glow hover:text-cyan-glow"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <h3 id={titleId} className="pr-12 font-display text-2xl font-bold sm:text-3xl">
          {project ? (en && base ? t(`${base}.title`) : project.titre) : t('api.loading')}
        </h3>
        <ApiState loading={detail.loading} error={detail.error} retry={detail.retry} compact />

        {project && (
          <>
            <p className="mt-1 text-sm font-semibold text-cyan-glow">{project.annee}</p>

            {Array.isArray(highlights) && highlights.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {highlights.map((h) => (
                  <div key={h.label} className="rounded-xl border border-cyan-glow/20 bg-cyan-glow/5 p-4">
                    <dd className="font-display text-2xl font-bold text-cyan-glow">{h.value}</dd>
                    <dt className="mt-1 text-xs text-ink-soft">{h.label}</dt>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 space-y-7">
              <section>
                <h4 className={sectionTitle}>{t('projects.summaryLabel')}</h4>
                <p className="mt-2 leading-relaxed text-ink-soft">
                  {en && base ? t(`${base}.summary`) : (project.description_longue ?? project.description)}
                </p>
              </section>

              {base && (
                <>
                  <section>
                    <h4 className={sectionTitle}>{t('projects.labels.context')}</h4>
                    <p className="mt-2 leading-relaxed text-ink-soft">{t(`${base}.context`)}</p>
                  </section>
                  <section>
                    <h4 className={sectionTitle}>{t('projects.labels.problem')}</h4>
                    <p className="mt-2 leading-relaxed text-ink-soft">{t(`${base}.problem`)}</p>
                  </section>
                  <section>
                    <h4 className={sectionTitle}>{t('projects.labels.objectives')}</h4>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft marker:text-cyan-glow">
                      {objectives.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className={sectionTitle}>{t('projects.labels.method')}</h4>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-ink-soft marker:text-cyan-glow">
                      {method.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </section>
                  <section>
                    <h4 className={sectionTitle}>{t('projects.labels.results')}</h4>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft marker:text-cyan-glow">
                      {results.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {hasLimits && (
                      <p className="mt-4 rounded-xl border border-ink-soft/20 p-4 text-sm leading-relaxed text-ink-soft">
                        <span className="font-semibold text-ink">{t('projects.labels.limits')} : </span>
                        {t(`${base}.limits`)}
                      </p>
                    )}
                  </section>
                </>
              )}

              {extra && extra.images.length > 0 && (
                <section>
                  <h4 className={sectionTitle}>{t('projects.labels.visuals')}</h4>
                  <div className="mt-3 grid gap-4">
                    {extra.images.map((src, i) => (
                      <img key={src} src={src} alt={imageAlts[i] ?? ''} loading="lazy" className="w-full rounded-xl bg-white p-1" />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h4 className={sectionTitle}>{t('projects.labels.tech')}</h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.competences.map((s) => (
                    <li key={s} className="rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-1 text-sm font-medium">
                      {skillName(s)}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className={sectionTitle}>{t('projects.similarTitle')}</h4>
                <ApiState
                  loading={similar.loading || own.loading}
                  error={similar.error}
                  retry={similar.retry}
                  errorLabel={t('projects.similarError')}
                  compact
                />
                {similar.data && !own.loading && similarItems.length === 0 && (
                  <p className="mt-2 text-sm text-ink-soft">{t('projects.similarNone')}</p>
                )}
                {similar.data && similarItems.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {similarItems.map((s) => (
                      <li key={s.projet_slug}>
                        <button
                          type="button"
                          onClick={() => onSelect(s.projet_slug)}
                          className="w-full rounded-xl border border-cyan-glow/20 p-3 text-left transition-colors hover:border-cyan-glow hover:bg-cyan-glow/5"
                        >
                          <span className="font-semibold">{s.titre}</span>
                          <span className="mt-1 block text-xs text-ink-soft">
                            {s.competences_communes.map(skillName).join(', ')} · {s.nb_communes} {t('projects.commonSkills')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {(project.lien_repo || project.lien_demo) && (
                <div className="flex flex-wrap gap-3">
                  {project.lien_repo && (
                    <a
                      href={project.lien_repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/50 px-5 py-2.5 font-semibold transition-colors hover:bg-cyan-glow/10"
                    >
                      <ExternalLink aria-hidden="true" className="size-4" />
                      {t('projects.github')}
                    </a>
                  )}
                  {project.lien_demo && (
                    <a
                      href={project.lien_demo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/50 px-5 py-2.5 font-semibold transition-colors hover:bg-cyan-glow/10"
                    >
                      <ExternalLink aria-hidden="true" className="size-4" />
                      {t('projects.demo')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
