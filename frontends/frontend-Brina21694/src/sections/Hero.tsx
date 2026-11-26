import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { PointerEvent } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DataFlows from '@/components/hero/DataFlows'
import FloatingCharts from '@/components/hero/FloatingCharts'
import Globe from '@/components/hero/Globe'
import ParticleField from '@/components/hero/ParticleField'
import { CONTACT } from '@/data/contact'
import { useApi } from '@/hooks/useApi'
import { api } from '@/services/api'


// Affichées tant que l'API (top 5 des compétences) n'a pas répondu, ou si elle est indisponible.
const FALLBACK_TAGS = ['Python', 'SQL', 'Power BI', 'PySpark']

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
})

export default function Hero() {
  // R6 : compétences phares (GET /api/stats/competences?limit=5)
  const top = useApi((signal) => api.getStats(5, signal))
  const tags = top.data && top.data.items.length > 0 ? top.data.items.map((x) => x.nom) : FALLBACK_TAGS
  const { t } = useTranslation()
  const reduced = useReducedMotion()

  // Léger effet de profondeur : l'ensemble globe + graphiques s'incline vers la souris (écrans à souris uniquement)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-1, 1], [-7, 7]), { stiffness: 80, damping: 18 })
  const rotateX = useSpring(useTransform(py, [-1, 1], [6, -6]), { stiffness: 80, damping: 18 })

  const onVisualMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set(((event.clientX - rect.left) / rect.width) * 2 - 1)
    py.set(((event.clientY - rect.top) / rect.height) * 2 - 1)
  }
  const onVisualLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-screen scroll-mt-24 items-center overflow-hidden px-6 pb-16 pt-28 sm:px-8 lg:pt-24"
    >
      {/* Décor immersif */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(47,107,255,0.18),transparent_60%)]" />
      <DataFlows />
      <ParticleField />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 md:gap-14 lg:grid-cols-[1fr_1fr] lg:gap-8 xl:gap-16">
        {/* Texte */}
        <div>
          <motion.p
            {...fadeUp(0.1)}
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow sm:text-xs sm:tracking-[0.24em]"
          >
            {t('hero.eyebrow')}
          </motion.p>

          <motion.h1
            {...fadeUp(0.25)}
            id="hero-title"
            className="font-display text-[2.5rem] font-bold leading-[1.08] sm:text-6xl lg:text-[3.4rem] xl:text-6xl"
          >
            {t('hero.titleStart')}{' '}
            <span className="bg-gradient-to-r from-cyan-glow to-electric bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.4)} className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg lg:max-w-lg xl:max-w-xl">
            {t('hero.intro')}
          </motion.p>

          <motion.ul {...fadeUp(0.5)} className="mt-6 flex flex-wrap gap-2" aria-label={t('hero.toolsLabel')}>
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-1 text-xs font-medium text-cyan-glow"
              >
                {tag}
              </li>
            ))}
          </motion.ul>

          <motion.div {...fadeUp(0.6)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-electric px-7 py-3 font-semibold text-void shadow-glow transition-transform hover:scale-[1.03]"
            >
              {t('hero.ctaProjects')}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={CONTACT.cv}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-glow/50 px-7 py-3 font-semibold text-ink transition-colors hover:bg-cyan-glow/10"
            >
              <Download aria-hidden="true" className="size-4" />
              {t('hero.ctaCv')}
            </a>
          </motion.div>
        </div>

        {/* Globe + graphiques flottants */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          onPointerMove={onVisualMove}
          onPointerLeave={onVisualLeave}
          style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
          className="relative mx-auto w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[520px]"
        >
          <Globe />
          <FloatingCharts />
          <p className="absolute -bottom-2 right-0 text-[10px] text-ink-soft/70">{t('hero.illustrative')}</p>
        </motion.div>
      </div>
    </section>
  )
}
