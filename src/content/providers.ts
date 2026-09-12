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
  { name: 'kyberswap', displayName: 'KyberSwap', kind: 'Same-chain swaps', summary: 'An aggregator that searches DEX pools across many chains and splits a swap where it pays.' },
  { name: 'openocean', displayName: 'OpenOcean', kind: 'Same-chain swaps', summary: "Same-chain swaps routed across OpenOcean's aggregated DEX liquidity." },
  { name: 'okx', displayName: 'OKX DEX', kind: 'Same-chain swaps', summary: "Same-chain swaps routed through OKX's on-chain DEX aggregator. You still sign from your own wallet." },
  { name: 'paraswap', displayName: 'ParaSwap', kind: 'Same-chain swaps', summary: 'The Velora aggregator, routing one swap through the best mix of DEX liquidity on the chain.' },
  { name: 'lifi', displayName: 'LI.FI', kind: 'Swap and bridge aggregator', summary: 'Joins bridges and DEXs into one cross-chain route, including the swap on either side.' },
  { name: 'socket', displayName: 'Socket / Bungee', kind: 'Swap and bridge aggregator', summary: 'Compares bridge routes and destination swaps to move assets between chains in one step.' },
  { name: 'across', displayName: 'Across', kind: 'Bridge', summary: 'An intent-based bridge: relayers front the funds on the destination chain, so transfers land fast.' },
  { name: 'stargate', displayName: 'Stargate', kind: 'Bridge', summary: 'A LayerZero bridge built on unified liquidity pools for native asset transfers between chains.' },
  { name: 'relay', displayName: 'Relay', kind: 'Swap and bridge', summary: 'A solver network that fills swaps and cross-chain transfers in seconds, often in a single transaction.' },
  { name: 'rango', displayName: 'Rango', kind: 'Swap and bridge aggregator', summary: 'Finds the best route over dozens of DEXs and bridges and settles it in one transaction.' },
  { name: 'squid', displayName: 'Squid', kind: 'Swap and bridge aggregator', summary: 'Swaps any token across chains in one transaction, over Axelar, CCTP and DEX liquidity.' },
  { name: 'symbiosis', displayName: 'Symbiosis', kind: 'Bridge', summary: 'Cross-chain swaps settled through Symbiosis liquidity, in one signed transaction.' },
  { name: 'near_intents', displayName: 'NEAR Intents', kind: 'Bridge', summary: 'Solvers compete to fill your cross-chain swap: you send one transfer and receive at least the quoted minimum, or get refunded.' },
  { name: 'mayan', displayName: 'Mayan', kind: 'Bridge', summary: 'Moves assets between chains in seconds, with solvers bidding to fill each order and a guaranteed minimum on arrival.' },
  { name: 'debridge', displayName: 'deBridge', kind: 'Bridge', summary: 'Cross-chain orders with an exact output: a solver delivers the full amount, or the order is refunded.' },
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
