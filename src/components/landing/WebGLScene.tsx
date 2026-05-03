// src/components/landing/WebGLScene.tsx
import { useEffect, useRef, useState } from 'react'

export function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [threeReady, setThreeReady] = useState(false)

  useEffect(() => {
    if ((window as any).THREE) {
      setThreeReady(true)
      return
    }
    const script = document.querySelector('script[src*="three.js"]')
    if (script) {
      script.addEventListener('load', () => setThreeReady(true))
    } else {
      const observer = new MutationObserver((mutations) => {
        if ((window as any).THREE) {
          setThreeReady(true)
          observer.disconnect()
        }
      })
      observer.observe(document.head, { childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!threeReady) return
    const canvas = canvasRef.current
    if (!canvas) return
    const THREE = (window as any).THREE
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 10)
    scene.add(new THREE.AmbientLight(0xffffff, 0.15))
    const light1 = new THREE.DirectionalLight(0xffffff, 1.2)
    light1.position.set(4, 6, 6)
    scene.add(light1)
    const light2 = new THREE.PointLight(0xaaaaaa, 1.5, 40)
    light2.position.set(-6, -4, 4)
    scene.add(light2)
    const light3 = new THREE.PointLight(0xffffff, 0.8, 30)
    light3.position.set(6, 4, -4)
    scene.add(light3)
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 96, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a, metalness: 0.0, roughness: 0.0, transmission: 0.92,
        thickness: 2.0, ior: 1.5, reflectivity: 0.9, transparent: true, opacity: 0.65,
      })
    )
    scene.add(sphere)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.005, 2, 256),
      new THREE.MeshBasicMaterial({ color: 0x404040, transparent: true, opacity: 0.6 })
    )
    ring1.rotation.x = Math.PI * 0.3
    scene.add(ring1)
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.003, 2, 256),
      new THREE.MeshBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0.4 })
    )
    ring2.rotation.x = Math.PI * 0.6
    ring2.rotation.z = Math.PI * 0.2
    scene.add(ring2)
    const PARTICLE_COUNT = 3200
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const th = Math.random() * Math.PI * 2,
        ph = Math.acos(2 * Math.random() - 1),
        r = 4 + Math.random() * 18
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th)
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      positions[i * 3 + 2] = r * Math.cos(ph)
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particles = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: 0x666666, size: 0.05, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending,
      })
    )
    scene.add(particles)
    const orbitals: any[] = []
    ;[
      { radius: 3.8, speed: 0.28, size: 0.08, phase: 0, tiltX: 0.4 },
      { radius: 4.4, speed: 0.18, size: 0.05, phase: 2.1, tiltX: -0.3 },
      { radius: 3.2, speed: 0.38, size: 0.06, phase: 4.2, tiltX: 0.7 },
    ].forEach((d) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(d.size, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.7 })
      )
      scene.add(m)
      orbitals.push({ mesh: m, ...d })
    })
    const gridHelper = new THREE.GridHelper(40, 40, 0x1a1a1a, 0x1a1a1a)
    gridHelper.position.y = -6
    ;(gridHelper.material as any).transparent = true
    ;(gridHelper.material as any).opacity = 0.25
    scene.add(gridHelper)
    let tX = 0, tY = 0, cX = 0, cY = 0
    const onMouse = (e: MouseEvent) => {
      tY = ((e.clientX / window.innerWidth) - 0.5) * 0.6
      tX = ((e.clientY / window.innerHeight) - 0.5) * 0.4
    }
    window.addEventListener('mousemove', onMouse)
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    const clock = new THREE.Clock()
    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      cX += (tX - cX) * 0.04
      cY += (tY - cY) * 0.04
      sphere.rotation.y = t * 0.06 + cY
      sphere.rotation.x = cX * 0.5
      sphere.scale.setScalar(1 + Math.sin(t * 0.9) * 0.012)
      ring1.rotation.z = t * 0.07
      ring2.rotation.y = t * 0.05
      ring1.rotation.y = cY * 0.3
      particles.rotation.y = t * 0.018
      particles.rotation.x = t * 0.008
      ;(particles.material as any).opacity = 0.28 + Math.sin(t * 0.4) * 0.08
      orbitals.forEach((o) => {
        const a = t * o.speed + o.phase
        o.mesh.position.x = Math.cos(a) * o.radius
        o.mesh.position.y = Math.sin(a * o.tiltX) * 1.2
        o.mesh.position.z = Math.sin(a) * o.radius * 0.6
      })
      ;(light2 as any).intensity = 1.2 + Math.sin(t * 0.7) * 0.4
      gridHelper.position.y = -6 + Math.sin(t * 0.3) * 0.15
      renderer.render(scene, camera)
    }
    animate()
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
      renderer.dispose()
    }
  }, [threeReady])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
}