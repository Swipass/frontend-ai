// src/content/providers.ts
// What each integrated liquidity provider does, keyed by the backend provider
// `name` from GET /v1/providers. The list mirrors PROVIDER_REGISTRY in the
// backend and is what the site shows until the live list loads.

export interface ProviderProfile {
  name: string
  displayName: string
  kind: string
  summary: string
}

export const PROVIDER_PROFILES: ProviderProfile[] = [
  { name: '0x', displayName: '0x Protocol', kind: 'Same-chain swaps', summary: 'Aggregated DEX liquidity for swaps within one chain, quoted through the 0x Swap API.' },
  { name: '1inch', displayName: '1inch', kind: 'Same-chain swaps', summary: 'Pathfinding across DEX pools that can split one swap over several routes for a better rate.' },
  { name: 'uniswap', displayName: 'Uniswap', kind: 'Same-chain swaps', summary: 'Direct on-chain quotes from Uniswap v3 pools, with no aggregator in between.' },
  { name: 'lifi', displayName: 'LI.FI', kind: 'Swap and bridge aggregator', summary: 'Joins bridges and DEXs into one cross-chain route, including the swap on either side.' },
  { name: 'socket', displayName: 'Socket / Bungee', kind: 'Swap and bridge aggregator', summary: 'Compares bridge routes and destination swaps to move assets between chains in one step.' },
  { name: 'across', displayName: 'Across', kind: 'Bridge', summary: 'An intent-based bridge: relayers front the funds on the destination chain, so transfers land fast.' },
  { name: 'stargate', displayName: 'Stargate', kind: 'Bridge', summary: 'A LayerZero bridge built on unified liquidity pools for native asset transfers between chains.' },
]

/** The profile for a live provider, or a plain one for a provider added later. */
export function profileFor(name: string, displayName?: string): ProviderProfile {
  return (
    PROVIDER_PROFILES.find((profile) => profile.name === name) ?? {
      name,
      displayName: displayName || name,
      kind: 'Liquidity provider',
      summary: 'An integrated liquidity source, quoted alongside every other provider on each request.',
    }
  )
}
