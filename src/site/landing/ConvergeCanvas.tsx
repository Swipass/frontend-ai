// src/site/landing/ConvergeCanvas.tsx
// Strings of light flowing in from both edges and gathering at the card in
// the middle: every provider's liquidity converging on one route.
import { useEffect, useRef, type RefObject } from 'react'
import { usePrefersReducedMotion } from '../hooks'

export function ConvergeCanvas({ targetRef }: { targetRef: RefObject<HTMLElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let frame = 0
    let visible = true
    let dpr = 1
    let target = { left: 0, right: 0, top: 0, bottom: 0 }

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      const box = canvas.getBoundingClientRect()
      const card = targetRef.current?.getBoundingClientRect()
      if (!card) return
      target = {
        left: (card.left - box.left) * dpr,
        right: (card.right - box.left) * dpr,
        top: (card.top - box.top + card.height * 0.28) * dpr,
        bottom: (card.bottom - box.top - card.height * 0.28) * dpr,
      }
    }

    const draw = (time: number) => {
      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)
      const count = w < 900 * dpr ? 26 : 44
      ctx.lineWidth = dpr

      for (const side of [-1, 1]) {
        const edge = side < 0 ? 0 : w
        const end = side < 0 ? target.left : target.right
        const span = Math.abs(end - edge)
        for (let i = 0; i < count; i++) {
          const f = i / (count - 1)
          const startY = h * (-0.05 + f * 1.1)
          const endY = target.top + (target.bottom - target.top) * f
          const wave = Math.sin(time * 0.0007 + i * 0.28 + (side > 0 ? 1.7 : 0)) * (10 + 22 * Math.abs(f - 0.5)) * dpr
          ctx.strokeStyle = `rgba(10,10,10,${0.1 + 0.28 * (1 - Math.abs(f - 0.5) * 1.4)})`
          ctx.beginPath()
          ctx.moveTo(edge, startY)
          ctx.bezierCurveTo(
            edge - side * span * 0.42, startY + wave,
            end + side * span * 0.38, endY - wave * 0.4,
            end, endY,
          )
          ctx.stroke()
        }
      }
    }

    const loop = (time: number) => {
      if (visible) draw(time)
      frame = requestAnimationFrame(loop)
    }

    measure()
    const resize = new ResizeObserver(() => {
      measure()
      if (reduced) draw(0)
    })
    resize.observe(canvas)
    if (targetRef.current) resize.observe(targetRef.current)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    visibility.observe(canvas)

    if (reduced) draw(0)
    else frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      visibility.disconnect()
    }
  }, [reduced, targetRef])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
