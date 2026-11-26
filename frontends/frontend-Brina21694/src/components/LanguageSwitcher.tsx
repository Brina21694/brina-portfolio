import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@/translations'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="flex rounded-full border border-ink-soft/25 p-0.5 text-xs font-semibold"
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = i18n.resolvedLanguage === lang
        return (
          <button
            key={lang}
            type="button"
            lang={lang}
            aria-pressed={isActive}
            onClick={() => void i18n.changeLanguage(lang)}
            className={`rounded-full px-3 py-1 transition-colors ${
              isActive
                ? 'bg-cyan-glow text-void'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
