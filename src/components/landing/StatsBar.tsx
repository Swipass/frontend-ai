// src/components/landing/StatsBar.tsx
import { AnimatedCounter } from './AnimatedCounter'
import { SystemStats } from '../../services/intentService'

interface StatsBarProps {
  stats: SystemStats | null
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { val: stats?.total_chains_supported ?? 8, suffix: '', label: 'Supported Chains', decimals: 0 },
    { val: 0.10, suffix: '%', label: 'Fee for Direct Users', decimals: 2 },
    { val: 50, suffix: '%', label: 'Developer Revenue Share', decimals: 0 },
    { val: 0, suffix: '', label: 'Accounts Required', decimals: 0 },
  ]

  return (
    <div className="py-10 md:py-14 px-6 border-y border-dark-grey-3 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center md:text-left">
        {items.map((s, i) => (
          <div key={i} className="reveal">
            <div className="font-display text-3xl sm:text-4xl font-extrabold text-almost-white tracking-tighter">
              <AnimatedCounter target={s.val} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="text-xs uppercase tracking-wider text-light-grey-1 mt-1">{s.label}</div>
            <div className="w-10 h-px bg-mid-grey mt-3 mx-auto md:mx-0" />
          </div>
        ))}
      </div>
    </div>
  )
}