import { useCallback, useEffect, useRef, useState } from 'react'

export interface ApiResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => void
}

interface Settled<T> {
  key: string
  data: T | null
  error: Error | null
}

/** Charge des données d'API. `deps` relance l'appel ; `retry()` le relance à la main. */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly (string | number | undefined)[] = [],
): ApiResult<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const latest = useRef(fetcher)
  useEffect(() => {
    latest.current = fetcher
  })
  const key = `${deps.join('|')}#${attempt}`

  useEffect(() => {
    const ctrl = new AbortController()
    latest
      .current(ctrl.signal)
      .then((data) => setSettled({ key, data, error: null }))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        setSettled({ key, data: null, error: e instanceof Error ? e : new Error('error') })
      })
    return () => ctrl.abort()
  }, [key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const current = settled?.key === key ? settled : null
  return { data: current?.data ?? null, loading: current === null, error: current?.error ?? null, retry }
}
