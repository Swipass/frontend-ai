// src/pages/DeveloperDashboard/components/cells.tsx
// Table cells the request lists share: a route with its tokens, and a
// transaction hash that links to the right explorer when we know the chain.
import { ExternalLink, explorerTx, shortAddr } from '../shared'
import { routeLabel } from '../format'

export function RouteCell({
  fromChain,
  toChain,
  fromToken,
  toToken,
}: {
  fromChain?: string | null
  toChain?: string | null
  fromToken?: string | null
  toToken?: string | null
}) {
  const tokens = fromToken || toToken ? `${fromToken || '?'} → ${toToken || '?'}` : null
  return (
    <div className="min-w-[9rem]">
      <div className="text-[color:var(--ink)]">{routeLabel(fromChain, toChain)}</div>
      {tokens && <div className="f-mono mt-0.5 text-[0.7rem] text-[color:var(--ink-4)]">{tokens}</div>}
    </div>
  )
}

export function TxLink({ chain, hash, head = 6, tail = 4 }: { chain?: string | null; hash?: string | null; head?: number; tail?: number }) {
  if (!hash) return <span className="text-[color:var(--ink-4)]">-</span>
  const href = explorerTx(chain, hash)
  const short = shortAddr(hash, head, tail)
  return href ? (
    <ExternalLink href={href}>
      <span className="f-mono">{short}</span>
    </ExternalLink>
  ) : (
    <span className="f-mono" title={hash}>
      {short}
    </span>
  )
}
