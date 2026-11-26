import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

// Indique si un élément est visible à l'écran, sans provoquer de nouveau rendu.
// Les animations (canvas) s'en servent pour se mettre en pause hors écran : économie de performance.
export function useOnScreen(target: RefObject<Element | null>) {
  const visible = useRef(true)

  useEffect(() => {
    const el = target.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return visible
}
