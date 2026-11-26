import { motion } from 'framer-motion'
import { ArrowRight, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { PRINCIPLES, QUALITIES } from '@/data/vision'

export default function Vision() {
  const { t } = useTranslation()

  return (
    <Section id="vision" title={t('nav.vision')} eyebrow={t('vision.eyebrow')}>
      {/* Phrase centrale */}
      <Reveal>
        <figure className="relative mt-10 overflow-hidden rounded-3xl border border-cyan-glow/25 bg-gradient-to-br from-deep/70 to-night p-8 shadow-glow sm:p-12">
          <Quote aria-hidden="true" className="absolute right-6 top-6 size-16 text-cyan-glow/15 sm:size-24" />
          <blockquote className="relative max-w-3xl font-display text-2xl font-semibold leading-snug sm:text-3xl lg:text-4xl">
            {t('vision.statement')}
          </blockquote>
          <figcaption className="relative mt-6 text-sm text-ink-soft">{t('vision.signature')}</figcaption>
        </figure>
      </Reveal>

      {/* Mes trois principes */}
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {PRINCIPLES.map(({ key, icon: Icon }, i) => (
          <li key={key}>
            <Reveal delay={i * 0.1} className="h-full">
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="glass h-full p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow/20 to-electric/30 text-cyan-glow">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{t(`vision.principles.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`vision.principles.${key}.text`)}</p>
              </motion.article>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Qualités + prochaine étape */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-glow">{t('vision.qualitiesTitle')}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {QUALITIES.map((quality) => (
              <li key={quality} className="rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-4 py-1.5 text-sm font-medium">
                {t(`vision.qualities.${quality}`)}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass p-6">
            <h3 className="font-display text-lg font-semibold">{t('vision.next.title')}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{t('vision.next.text')}</p>
            <a
              href="#contact"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-electric px-6 py-2.5 text-sm font-semibold text-void transition-transform hover:scale-[1.04]"
            >
              {t('vision.next.cta')}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
