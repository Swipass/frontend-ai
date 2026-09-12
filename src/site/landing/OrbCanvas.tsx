// src/site/landing/OrbCanvas.tsx
// A slowly turning sphere of points and threads with two orbit rings, drawn on
// a 2D canvas. It leans toward the pointer, pauses off screen, and renders a
// single still frame when the visitor prefers reduced motion.
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks'

type Vec = [number, number, number]

const POINT_COUNT = 260
const LINK_DISTANCE = 0.33
const PERSPECTIVE = 3.2

function fibonacciSphere(count: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    return [Math.cos(golden * i) * radius, y, Math.sin(golden * i) * radius] as Vec
  })
}

// Near neighbours only, thinned so the threads read as a sparse web.
function threadPairs(points: Vec[]): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const [a, b] = [points[i], points[j]]
      const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      if (distance < LINK_DISTANCE && (i * 7 + j * 13) % 5 === 0) pairs.push([i, j])
    }
  }
  return pairs
}

export function OrbCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const points = fibonacciSphere(POINT_COUNT)
    const pairs = threadPairs(points)
    const projected = points.map(() => ({ x: 0, y: 0, depth: 0 }))
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let size = 0
    let dpr = 1
    let frame = 0
    let visible = true

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = canvas.clientWidth
      canvas.width = size * dpr
      canvas.height = size * dpr
    }

    const draw = (time: number) => {
      const w = size * dpr
      const cx = w / 2
      const cy = w / 2
      const radius = w * 0.33
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      const rotY = time * 0.00011 + pointer.x * 0.5
      const rotX = -0.32 + pointer.y * 0.3
      const [sy, cyr, sx, cxr] = [Math.sin(rotY), Math.cos(rotY), Math.sin(rotX), Math.cos(rotX)]

      ctx.clearRect(0, 0, w, w)

      points.forEach(([x, y, z], i) => {
        const x1 = x * cyr - z * sy
        const z1 = x * sy + z * cyr
        const y2 = y * cxr - z1 * sx
        const z2 = y * sx + z1 * cxr
        const scale = PERSPECTIVE / (PERSPECTIVE - z2)
        projected[i].x = cx + x1 * radius * scale
        projected[i].y = cy + y2 * radius * scale
        projected[i].depth = (z2 + 1) / 2
      })

      ctx.lineWidth = 0.7 * dpr
      for (const [i, j] of pairs) {
        const depth = (projected[i].depth + projected[j].depth) / 2
        ctx.strokeStyle = `rgba(255,255,255,${0.015 + depth * depth * 0.2})`
        ctx.beginPath()
        ctx.moveTo(projected[i].x, projected[i].y)
        ctx.lineTo(projected[j].x, projected[j].y)
        ctx.stroke()
      }

      for (const point of projected) {
        const r = (0.5 + point.depth * 1.3) * dpr
        ctx.fillStyle = `rgba(255,255,255,${0.08 + point.depth * point.depth * 0.8})`
        ctx.beginPath()
        ctx.arc(point.x, point.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Two orbit rings, each carrying a bright satellite.
      const rings = [
        { rx: 1.3, ry: 0.36, tilt: -0.28, speed: 0.00028, phase: 0 },
        { rx: 1.12, ry: 0.5, tilt: 0.52, speed: -0.0002, phase: 2.1 },
      ]
      for (const ring of rings) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(ring.tilt + pointer.x * 0.1)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = dpr
        ctx.beginPath()
        ctx.ellipse(0, 0, radius * ring.rx, radius * ring.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        const angle = time * ring.speed + ring.phase
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * dpr)
        glow.addColorStop(0, 'rgba(255,255,255,0.95)')
        glow.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.translate(Math.cos(angle) * radius * ring.rx, Math.sin(angle) * radius * ring.ry)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, 0, 7 * dpr, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const loop = (time: number) => {
      if (visible) draw(time)
      frame = requestAnimationFrame(loop)
    }

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
    }

    resize()
    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (reduced) draw(0)
    })
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    visibility.observe(canvas)

    if (reduced) {
      draw(0)
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true })
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      window.removeEventListener('pointermove', onPointer)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />
}
