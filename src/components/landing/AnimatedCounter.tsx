// src/components/landing/AnimatedCounter.tsx
import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  decimals?: number
}

export function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = Date.now()
        const duration = 1800
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(eased * target)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}