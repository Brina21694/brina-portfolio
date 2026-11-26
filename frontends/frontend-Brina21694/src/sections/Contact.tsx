import { motion } from 'framer-motion'
import { Check, Copy, Download, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LinkedinIcon } from '@/components/BrandIcons'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { CONTACT } from '@/data/contact'
import { useApi } from '@/hooks/useApi'
import { api } from '@/services/api'

const fieldClass =
  'mt-2 w-full rounded-xl border border-ink-soft/25 bg-night/60 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-colors focus:border-cyan-glow'

export default function Contact() {
  // Courriel et LinkedIn viennent de GET /api/profil ; valeurs locales si l'API est indisponible.
  const profil = useApi(() => api.getProfil())
  const email = profil.data?.email ?? CONTACT.email
  const linkedin = profil.data?.liens.linkedin ?? CONTACT.linkedin
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Copie impossible (navigateur ou permission) : l'adresse reste visible et cliquable
    }
  }

  // Pas de serveur pour recevoir les messages : le formulaire ouvre l'application de courriel
  // de la personne avec un message déjà rédigé (lien mailto:).
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const from = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const subject = t('contact.form.mailSubject', { name })
    const body = `${message}\n\n${name}\n${from}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const cardClass =
    'glass group flex items-center gap-4 p-4 transition-[border-color,box-shadow] duration-300 hover:border-cyan-glow/60 hover:shadow-glow'
  const iconClass = 'grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow/20 to-electric/30 text-cyan-glow'

  return (
    <Section id="contact" title={t('nav.contact')} eyebrow={t('contact.eyebrow')}>
      <Reveal>
        <p className="mt-6 max-w-2xl text-ink-soft">{t('contact.intro')}</p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Coordonnées */}
        <ul className="grid content-start gap-4">
          <li>
            <Reveal>
              <div className={cardClass}>
                <span className={iconClass}>
                  <Mail aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-widest text-ink-soft">{t('contact.email')}</p>
                  <a href={`mailto:${email}`} className="block break-all font-medium hover:text-cyan-glow">
                    {email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={t('contact.copy')}
                  className="rounded-full border border-ink-soft/25 p-2 text-ink-soft transition-colors hover:border-cyan-glow hover:text-cyan-glow"
                >
                  {copied ? <Check aria-hidden="true" className="size-4 text-cyan-glow" /> : <Copy aria-hidden="true" className="size-4" />}
                </button>
              </div>
              <p role="status" className="sr-only">
                {copied ? t('contact.copied') : ''}
              </p>
            </Reveal>
          </li>

          <li>
            <Reveal delay={0.08}>
              <a href={linkedin} target="_blank" rel="noreferrer" className={cardClass}>
                <span className={iconClass}>
                  <LinkedinIcon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-ink-soft">LinkedIn</span>
                  <span className="font-medium group-hover:text-cyan-glow">brina-achouke</span>
                </span>
              </a>
            </Reveal>
          </li>

          <li>
            <Reveal delay={0.16}>
              <a href={CONTACT.cv} download className={cardClass}>
                <span className={iconClass}>
                  <Download aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-ink-soft">{t('contact.cvLabel')}</span>
                  <span className="font-medium group-hover:text-cyan-glow">{t('hero.ctaCv')}</span>
                </span>
              </a>
            </Reveal>
          </li>
        </ul>

        {/* Formulaire */}
        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="glass p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold">{t('contact.form.title')}</h3>

            <label className="mt-5 block text-sm text-ink-soft">
              {t('contact.form.name')}
              <input name="name" type="text" required autoComplete="name" className={fieldClass} />
            </label>

            <label className="mt-4 block text-sm text-ink-soft">
              {t('contact.form.email')}
              <input name="email" type="email" required autoComplete="email" className={fieldClass} />
            </label>

            <label className="mt-4 block text-sm text-ink-soft">
              {t('contact.form.message')}
              <textarea name="message" required rows={5} className={`${fieldClass} resize-y`} />
            </label>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-electric px-7 py-3 font-semibold text-void shadow-glow"
            >
              <Send aria-hidden="true" className="size-4" />
              {t('contact.form.send')}
            </motion.button>

            <p role="status" className="mt-4 text-sm text-ink-soft">
              {sent ? t('contact.form.opened') : t('contact.form.hint')}
            </p>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
