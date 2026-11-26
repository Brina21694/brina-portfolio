// Carte de chaleur des corrélations : un vrai tableau HTML (lisible par les lecteurs d'écran).
interface HeatmapProps {
  labels: string[]
  matrix: number[][]
  caption: string
}

// Positif : cyan, négatif : rose. Plus la valeur est loin de 0, plus la couleur est intense.
function cellColor(value: number): string {
  const strength = Math.min(1, Math.abs(value))
  const rgb = value >= 0 ? '34, 229, 255' : '255, 107, 138'
  return `rgba(${rgb}, ${0.12 + strength * 0.7})`
}

export default function Heatmap({ labels, matrix, caption }: HeatmapProps) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto w-full max-w-md border-separate border-spacing-1.5 text-center text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <td />
            {labels.map((label) => (
              <th key={label} scope="col" className="pb-1 text-xs font-medium text-ink-soft">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={labels[i]}>
              <th scope="row" className="pr-1 text-right text-xs font-medium text-ink-soft">
                {labels[i]}
              </th>
              {row.map((value, j) => (
                <td
                  key={labels[j]}
                  title={`${labels[i]} / ${labels[j]} : ${value.toFixed(2)}`}
                  className="rounded-lg py-3.5 font-semibold tabular-nums transition-transform duration-200 hover:scale-110"
                  style={{ background: cellColor(value) }}
                >
                  {value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
