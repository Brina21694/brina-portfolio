// Formate une date YYYY-MM selon la langue (« sept. 2024 » / « Sep 2024 »).
export function formatMonth(value: string, lang: string): string {
  const [y, m] = value.split('-').map(Number)
  if (!y || !m) return value
  return new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))
}

export function formatPeriod(debut: string, fin: string | null, lang: string, nowLabel: string): string {
  return `${formatMonth(debut, lang)} – ${fin ? formatMonth(fin, lang) : nowLabel}`
}
