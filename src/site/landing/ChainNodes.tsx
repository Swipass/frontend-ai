// src/site/landing/ChainNodes.tsx
// Chains Swipass settles on, floating at the hero's edges on curved rails with
// a light pulse running along each. Names and ids come from GET /v1/chains.
import type { ChainInfo } from '../../services/intentService'

type Chain = Pick<ChainInfo, 'name' | 'chain_id'>

// Shown until the live list loads: well-known EVM chains and their real ids.
const FALLBACK: Chain[] = [
  { name: 'Ethereum', chain_id: 1 },
  { name: 'Arbitrum', chain_id: 42161 },
  { name: 'Base', chain_id: 8453 },
  { name: 'Polygon', chain_id: 137 },
]

const SLOTS = [
  { side: 'left', rail: 'up', position: 'left-0 top-[19%]', delay: '0s' },
  { side: 'left', rail: 'down', position: 'left-0 top-[57%]', delay: '1.6s' },
  { side: 'right', rail: 'up', position: 'right-0 top-[19%]', delay: '0.8s' },
  { side: 'right', rail: 'down', position: 'right-0 top-[57%]', delay: '2.4s' },
] as const

const RAILS = {
  up: { path: 'M0 92 L130 92 C200 92 230 22 360 22', node: 92 },
  down: { path: 'M0 48 L130 48 C200 48 230 118 360 118', node: 48 },
}

// The API lists chains alphabetically; the hero leads with the busiest ones.
const PREFERRED = ['ethereum', 'arbitrum', 'base', 'polygon', 'optimism']
const rank = (key: string) => {
  const index = PREFERRED.indexOf(key)
  return index === -1 ? PREFERRED.length : index
}

export function ChainNodes({ chains }: { chains: ChainInfo[] }) {
  const shown: Chain[] =
    chains.length >= 4 ? [...chains].sort((a, b) => rank(a.key) - rank(b.key)).slice(0, 4) : FALLBACK

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      {SLOTS.map((slot, i) => {
        const chain = shown[i]
        const rail = RAILS[slot.rail]
        const nodeTop = `${(rail.node / 140) * 100}%`
        const labelBelow = slot.rail === 'up'
        return (
          <div key={slot.position} className={`absolute h-[140px] w-[25%] ${slot.position}`}>
            <svg
              viewBox="0 0 360 140"
              preserveAspectRatio="none"
              className={`absolute inset-0 h-full w-full ${slot.side === 'right' ? '-scale-x-100' : ''}`}
            >
              <defs>
                <linearGradient id={`rail-${i}`} x1="0" x2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.35" stopColor="#fff" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.06" />
                </linearGradient>
              </defs>
              <path d={rail.path} fill="none" stroke={`url(#rail-${i})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <circle r="2.2" fill="#fff" opacity="0.9">
                <animateMotion dur="5.5s" begin={slot.delay} repeatCount="indefinite" path={rail.path} />
              </circle>
            </svg>
            <div
              className="node-float absolute"
              style={{
                top: nodeTop,
                [slot.side === 'left' ? 'left' : 'right']: '36%',
                ['--delay' as string]: slot.delay,
              }}
            >
              <div className="relative -translate-y-1/2 translate-x-[-50%] rtl:translate-x-[50%]">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.14] bg-white/[0.05] text-[0.8rem] font-medium text-[color:var(--ink)] backdrop-blur-md">
                  {chain.name.slice(0, 2)}
                </div>
                <div
                  className={`absolute left-1/2 w-max -translate-x-1/2 text-left ${labelBelow ? 'top-[3.1rem]' : 'bottom-[3.1rem]'}`}
                >
                  <div className="flex items-center gap-2 text-[0.95rem] text-[color:var(--ink)]">
                    <span className="h-1 w-1 rounded-full bg-[color:var(--ink)]" />
                    {chain.name}
                  </div>
                  <div className="f-mono pl-3 text-[0.68rem] text-[color:var(--ink-4)]">Chain ID {chain.chain_id}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
