import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Orbit, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { NAV_IDS, NAV_ITEMS } from '@/data/navigation'
import { useActiveSection } from '@/hooks/useActiveSection'

export default function Navbar() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeId = useActiveSection(NAV_IDS)

  // La touche Échap ferme le menu mobile (accessibilité clavier)
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const linkClass = (id: string) =>
    `rounded-full px-3 py-1.5 text-sm transition-colors ${
      activeId === id
        ? 'bg-electric/25 text-cyan-glow'
        : 'text-ink-soft hover:text-ink'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <nav
        aria-label={t('nav.mainNavigation')}
        className="glass mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5"
      >
        <a href="#home" className="flex items-center gap-2 font-display font-bold tracking-wide">
          <Orbit aria-hidden="true" className="size-6 text-cyan-glow" />
          <span className="flex flex-col leading-none">
            <span className="text-sm tracking-[0.18em]">ACHOUKE Brina</span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-glow">
              {t('nav.ownerRole')}
            </span>
          </span>
        </a>

        {/* Menu pour grands écrans */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? 'true' : undefined}
                className={linkClass(item.id)}
              >
                {t(item.labelKey)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className="rounded-full p-2 text-ink-soft hover:text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-2 max-w-6xl p-3 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'true' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`block ${linkClass(item.id)} py-2.5 text-base`}
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
