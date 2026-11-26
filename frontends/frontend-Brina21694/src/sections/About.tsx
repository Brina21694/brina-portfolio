import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { FACT_KEYS, PILLARS } from '@/data/profile'

export default function About() {
  const { t } = useTranslation()

  return (
    <Section id="about" title={t('nav.about')} eyebrow={t('about.eyebrow')}>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* Texte + informations clés */}
        <div>
          <Reveal>
            <p className="text-lg leading-relaxed text-ink">{t('about.lead')}</p>
            <p className="mt-5 leading-relaxed text-ink-soft">{t('about.body')}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="glass mt-8 divide-y divide-ink-soft/15 p-2">
              {FACT_KEYS.map((key) => (
                <div key={key} className="grid gap-1 px-4 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-cyan-glow">
                    {t(`about.facts.${key}.label`)}
                  </dt>
                  <dd className="text-ink-soft">{t(`about.facts.${key}.value`)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Les trois domaines */}
        <ul className="grid content-start gap-4">
          {PILLARS.map(({ key, icon: Icon }, i) => (
            <li key={key}>
              <Reveal delay={0.1 + i * 0.12}>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="glass group flex gap-4 p-5 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow/20 to-electric/30 text-cyan-glow">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{t(`about.pillars.${key}.title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t(`about.pillars.${key}.text`)}</p>
                  </div>
                </motion.article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
