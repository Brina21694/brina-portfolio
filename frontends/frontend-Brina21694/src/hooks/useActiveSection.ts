import { useEffect, useState } from 'react'

// Retourne l'id de la section en cours de lecture (pour surligner le menu).
// Règle simple : la section active est la dernière dont le haut est passé au-dessus d'une ligne
// placée à 45 % de la hauteur de l'écran. On recalcule au défilement, au redimensionnement
// et à chaque changement de hauteur de la page (onglets, sections chargées après coup...).
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    let frame = 0

    const compute = () => {
      frame = 0
      const line = window.innerHeight * 0.45
      let current = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // En bas de page, la dernière section est active même si elle est courte
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom && ids.length > 0) current = ids[ids.length - 1]
      setActive(current)
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const main = document.getElementById('main')
    const resizeObserver = new ResizeObserver(schedule)
    if (main) resizeObserver.observe(main)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver.disconnect()
    }
  }, [ids])

  return active
}
