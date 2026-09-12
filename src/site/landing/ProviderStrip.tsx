// src/site/landing/ProviderStrip.tsx
// The quiet logotype row under the hero: every provider Swipass quotes.
import { PROVIDER_PROFILES, profileFor } from '../../content/providers'
import type { ProviderInfo } from '../../services/intentService'

export function ProviderStrip({ providers }: { providers: ProviderInfo[] }) {
  const names = providers.length
    ? providers.map((p) => profileFor(p.name, p.display_name).displayName)
    : PROVIDER_PROFILES.map((p) => p.displayName)
  const loop = [...names, ...names]

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-6 py-10 sm:py-12 md:flex-row md:gap-10">
      <span className="kicker shrink-0">Routing across</span>
      <div
        className="relative w-full overflow-hidden"
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}
      >
        <div className="flex w-max animate-marquee gap-12 [animation-duration:36s] hover:[animation-play-state:paused]">
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= names.length}
              className="flex items-center gap-2.5 whitespace-nowrap text-[1.15rem] font-medium tracking-[-0.03em] text-[color:var(--ink-4)] transition-colors hover:text-[color:var(--ink)]"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md border border-current text-[0.62rem] font-semibold">
                {name.charAt(0)}
              </span>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
