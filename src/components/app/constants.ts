// src/components/app/constants.ts
// Shared constants for the app command center.

// Chain ids, explorers, names and tokens are NOT hardcoded here: they come from
// the backend (/v1/chains and /v1/tokens), which derives them from the providers'
// capabilities combined uniquely. See useIntentExecution and intentService.

/**
 * Suggested commands, written from the chains and tokens actually supported
 * right now.
 *
 * A fixed list would keep suggesting a route the platform may no longer serve,
 * which is a confusing way to greet someone: the suggestion fails and the user
 * blames their phrasing. Building them from the live lists means a suggestion
 * always works.
 */
export function buildQuickCommands(
  chains: { name: string }[],
  tokens: string[],
): string[] {
  if (chains.length === 0) return []

  const names = chains.map(c => c.name)
  const pick = (i: number) => names[i % names.length]
  const stable = tokens.find(t => t === 'USDC') || tokens.find(t => t === 'USDT') || tokens[1]
  const native = tokens[0]
  const commands: string[] = []

  if (native && names.length > 1) {
    commands.push(`Bridge 0.1 ${native} from ${pick(0)} to ${pick(1)}`)
  }
  if (stable && native) {
    commands.push(`Swap 100 ${stable} for ${native} on ${pick(0)}`)
  }
  if (stable && names.length > 2) {
    commands.push(`Send 50 ${stable} from ${pick(1)} to ${pick(2)}`)
  }
  if (stable && names.length > 1) {
    commands.push(`Move all ${stable} from ${pick(2)} to ${pick(0)}`)
  }
  return commands.filter(Boolean)
}

// Tokens we can treat as ~1 USD for a best-effort volume figure.
const USD_STABLES = new Set(['USDC', 'USDT', 'DAI', 'USDBC', 'USDC.E', 'FDUSD', 'TUSD'])

// Best-effort USD volume from a quote. Returns undefined when neither side is a
// known stablecoin, so the stats tiles can stay hidden rather than show $0.
export function volumeFromQuote(quote: {
  from_token: string
  to_token: string
  from_amount: string
  to_amount: string
}): number | undefined {
  const from = parseFloat(quote.from_amount)
  const to = parseFloat(quote.to_amount)
  if (USD_STABLES.has(quote.from_token?.toUpperCase()) && isFinite(from)) return from
  if (USD_STABLES.has(quote.to_token?.toUpperCase()) && isFinite(to)) return to
  return undefined
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Breakpoint below which the app renders the mobile / tablet single-column
// layout with a bottom tab bar and bottom-sheet drawers.
export const MOBILE_BREAKPOINT = 900

export type MobileTab = 'command' | 'preview' | 'history'
