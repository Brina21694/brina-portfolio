import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ApiStateProps {
  loading: boolean
  error: Error | null
  retry: () => void
  /** Message d'erreur plus précis (sinon message général). */
  errorLabel?: string
  compact?: boolean
}

// Affiche « chargement » ou « erreur + réessayer » ; ne rend rien quand tout va bien.
export default function ApiState({ loading, error, retry, errorLabel, compact }: ApiStateProps) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <p role="status" className={`flex items-center gap-2 text-ink-soft ${compact ? 'mt-3 text-sm' : 'mt-10'}`}>
        <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        {t('api.loading')}
      </p>
    )
  }
  if (error) {
    return (
      <div role="alert" className={`glass flex flex-wrap items-center gap-3 p-4 text-sm ${compact ? 'mt-3' : 'mt-10'}`}>
        <AlertTriangle aria-hidden="true" className="size-5 shrink-0 text-cyan-glow" />
        <span className="text-ink-soft">{errorLabel ?? t('api.error')}</span>
        <button
          type="button"
          onClick={retry}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-cyan-glow/50 px-4 py-1.5 font-semibold transition-colors hover:bg-cyan-glow/10"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          {t('api.retry')}
        </button>
      </div>
    )
  }
  return null
}
