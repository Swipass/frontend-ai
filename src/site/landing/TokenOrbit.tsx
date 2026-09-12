// src/site/landing/TokenOrbit.tsx
// Asset tickers riding an arc over the orb: the one passing the front is large
// and bright, the ones turning away shrink, tilt and fade.
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks'

const TICKERS = ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT', 'ARB', 'OP', 'POL', 'LINK', 'UNI']

export function TokenOrbit() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let frame = 0
    let angle = 0
    const step = (Math.PI * 2) / TICKERS.length

    const place = () => {
      const width = container.clientWidth
      // Type scales with the orb, so neighbours never collide on short screens.
      container.style.fontSize = `${Math.round(width * 0.095)}px`
      const rx = width * 0.66
      const ry = width * 0.17
      const lift = width * 0.39
      itemRefs.current.forEach((item, i) => {
        if (!item) return
        let theta = (angle + i * step) % (Math.PI * 2)
        if (theta > Math.PI) theta -= Math.PI * 2
        const depth = Math.cos(theta)
        const front = Math.max(0, depth)
        const x = Math.sin(theta) * rx
        const y = -depth * ry - lift
        const scale = 0.42 + 0.58 * Math.pow(front, 1.6)
        item.style.opacity = depth > 0 ? String(0.08 + 0.92 * front * front) : '0'
        item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${Math.sin(theta) * 24}deg) scale(${scale})`
      })
    }

    const loop = () => {
      angle -= 0.0022
      place()
      frame = requestAnimationFrame(loop)
    }

    if (reduced) place()
    else frame = requestAnimationFrame(loop)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
    }
  }, [reduced])

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {TICKERS.map((ticker, i) => (
        <span
          key={ticker}
          ref={(el) => (itemRefs.current[i] = el)}
          className="absolute left-1/2 top-1/2 whitespace-nowrap text-[1em] font-light tracking-[-0.04em] text-[color:var(--ink)] opacity-0 will-change-transform"
        >
          {ticker}
        </span>
      ))}
    </div>
  )
}
