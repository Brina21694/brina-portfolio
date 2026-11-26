import { MotionConfig } from 'framer-motion'
import { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import Section from '@/components/Section'
import { NAV_ITEMS } from '@/data/navigation'
import About from '@/sections/About'
import Contact from '@/sections/Contact'
import Experience from '@/sections/Experience'
import Hero from '@/sections/Hero'
import Projects from '@/sections/Projects'
import Skills from '@/sections/Skills'
import Vision from '@/sections/Vision'

// Le Data Lab contient la bibliothèque de graphiques (lourde) : on la charge à part pour accélérer l'accueil.
const DataLab = lazy(() => import('@/sections/DataLab'))

// Sections déjà développées. Les autres affichent un emplacement provisoire, dans l'ordre du menu.
const READY_SECTIONS: Record<string, ComponentType> = {
  home: Hero,
  about: About,
  projects: Projects,
  'data-lab': DataLab,
  skills: Skills,
  experience: Experience,
  vision: Vision,
  contact: Contact,
}

export default function App() {
  const { t } = useTranslation()

  return (
    // reducedMotion="user" : les animations Framer Motion respectent la préférence du système
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-night focus:px-4 focus:py-2"
      >
        {t('nav.skipToContent')}
      </a>

      <Navbar />

      <main id="main" tabIndex={-1} className="outline-none">
        {NAV_ITEMS.map((item) => {
          const Ready = READY_SECTIONS[item.id]
          if (Ready) {
            return (
              <Suspense key={item.id} fallback={<Section id={item.id} title={t(item.labelKey)} className="min-h-[70vh]" />}>
                <Ready />
              </Suspense>
            )
          }
          return (
            <Section key={item.id} id={item.id} title={t(item.labelKey)} className="min-h-[70vh]">
              <p className="mt-4 text-ink-soft">{t('placeholder.soon')}</p>
            </Section>
          )
        })}
      </main>
    </MotionConfig>
  )
}
