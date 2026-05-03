// src/pages/LandingPage.tsx
import { useEffect, useState } from 'react'
import { intentService, SystemStats } from '../services/intentService'
import { WebGLScene } from '../components/landing/WebGLScene'
import { Navbar } from '../components/landing/Navbar'
import { HeroSection } from '../components/landing/HeroSection'
import { Marquee } from '../components/landing/Marquee'
import { FeaturesSection } from '../components/landing/FeaturesSection'
import { HowItWorksSection } from '../components/landing/HowItWorksSection'
import { DemoSection } from '../components/landing/DemoSection'
import { StatsBar } from '../components/landing/StatsBar'
import { DeveloperSection } from '../components/landing/DeveloperSection'
import { ProvidersSection } from '../components/landing/ProvidersSection'
import { SecuritySection } from '../components/landing/SecuritySection'
import { FAQSection } from '../components/landing/FAQSection'
import { CTASection } from '../components/landing/CTASection'
import { Footer } from '../components/landing/Footer'

export default function LandingPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)

  useEffect(() => {
    // Load Three.js only once
    if (!(window as any).THREE) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.async = true
      document.head.appendChild(script)
    }

    // Fetch real stats
    intentService.getStats().then(setStats).catch(() => {})

    // Reveal on scroll
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el))

    // Cursor hover
    const addHover = () => {
      document.querySelectorAll('a,button,.sw-chip,.feature-card,.faq-btn,.provider-card,.sec-card,.qc-chip').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'))
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'))
      })
    }
    setTimeout(addHover, 200)

    return () => { revealObserver.disconnect() }
  }, [])

  return (
    <div className="bg-deepest-dark min-h-screen relative">
      <WebGLScene />
      <Navbar />
      <HeroSection />
      <Marquee />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <StatsBar stats={stats} />
      <DeveloperSection />
      <ProvidersSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}