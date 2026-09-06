// src/components/landing/ProvidersSection.tsx
import { ProviderInfo } from '../../services/intentService'

interface ProvidersSectionProps {
  /** Live provider list from intentService.getProviders(); empty until loaded. */
  providers: ProviderInfo[]
}

// Shown before the live list resolves, and as the source of truth for the
// integrated protocol set. Kept in sync with the backend provider registry.
const FALLBACK_PROVIDERS = [
  '0x', '1inch', 'Uniswap', 'LI.FI', 'Socket/Bungee', 'Across', 'Stargate',
]

const scoringRows = [
  { label: 'Output Amount', value: '70%' },
  { label: 'Speed Weight', value: '20%' },
  { label: 'Historical Success', value: '10%' },
  { label: 'Fallback', value: 'Auto on failure' },
]

export function ProvidersSection({ providers }: ProvidersSectionProps) {
  const names = providers.length
    ? providers.map((p) => p.display_name || p.name)
    : FALLBACK_PROVIDERS

  return (
    <section className="py-16 md:py-28 px-6 border-t border-dark-grey-3 bg-dark-grey-1 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div>
            <div className="section-label reveal mb-6">Provider Network</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
              Every route.<br /><span className="font-serif italic font-normal text-light-grey-2">Always optimal.</span>
            </h2>
          </div>
          <p className="max-w-md text-light-grey-1 text-sm leading-relaxed reveal reveal-delay-2">
            Swipass queries every integrated provider concurrently. A weighted score on output, speed, and 30-day historical success rate picks the winner, with automatic failover if a route expires mid-flight.
          </p>
        </div>

        {/* Live provider set, rendered as compact chips so the list scales as protocols are added. */}
        <div className="flex flex-wrap gap-3 mb-8 reveal reveal-delay-2">
          {names.map((name) => (
            <div
              key={name}
              className="provider-card inline-flex items-center gap-2 px-4 py-2.5 bg-deepest-dark border border-dark-grey-3 rounded-full transition-colors hover:bg-dark-grey-2 cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-light-grey-2 flex-shrink-0" />
              <span className="font-display text-sm font-semibold text-light-grey-3">{name}</span>
            </div>
          ))}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-deepest-dark border border-dashed border-dark-grey-3 rounded-full">
            <span className="font-mono text-xs uppercase tracking-wider text-light-grey-1">+ modular by design</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 p-5 border border-dark-grey-3 rounded-lg bg-deepest-dark">
          {scoringRows.map((item, i) => (
            <div key={i} className={`flex flex-col gap-1 ${i === 3 ? 'md:ml-auto md:pl-6 md:border-l md:border-dark-grey-3' : ''}`}>
              <div className="text-xs uppercase tracking-wider text-light-grey-1">{item.label}</div>
              <div className="font-display text-xl md:text-2xl font-bold text-almost-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
