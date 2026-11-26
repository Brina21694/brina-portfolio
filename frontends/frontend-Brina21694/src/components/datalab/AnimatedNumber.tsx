import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
}

// Affiche un nombre qui « glisse » vers sa nouvelle valeur (sans animation si réduite).
export default function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const current = useRef(value)

  useEffect(() => {
    if (reduced) return
    const controls = animate(current.current, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => {
        current.current = latest
        setShown(latest)
      },
    })
    return () => controls.stop()
  }, [value, reduced])

  // Animations réduites : on affiche directement la valeur, sans transition
  return <>{format(reduced ? value : shown)}</>
}
