// src/pages/LandingPage.tsx
import { useCursorHover, useLandingData } from '../site/hooks'
import { SiteFooter } from '../site/SiteFooter'
import { SiteNav } from '../site/SiteNav'
import { ConvergeSection } from '../site/landing/ConvergeSection'
import { DeveloperPanel } from '../site/landing/DeveloperPanel'
import { ElementCards } from '../site/landing/ElementCards'
import { FaqSection } from '../site/landing/FaqSection'
import { FinalCta } from '../site/landing/FinalCta'
import { FlowDiagram } from '../site/landing/FlowDiagram'
import { Hero } from '../site/landing/Hero'
import { ProviderStrip } from '../site/landing/ProviderStrip'
import { SecurityGrid } from '../site/landing/SecurityGrid'

export default function LandingPage() {
  // Live platform data; every section renders sensibly while it loads or if the API is down.
  const { stats, providers, chains } = useLandingData()
  const chainCount = chains.length || stats?.total_chains_supported || null
  useCursorHover()

  return (
    <div className="site min-h-screen bg-[#0a0a0a]">
      <SiteNav />
      <main>
        <Hero chains={chains} />
        <ProviderStrip providers={providers} />
        <FlowDiagram />
        <ElementCards />
        <ConvergeSection providers={providers} />
        <DeveloperPanel chainCount={chainCount} />
        <SecurityGrid />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
