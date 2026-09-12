// src/components/app/TokenRiskNotice.tsx
// Security flags a third party reports for the token being bought. A warning
// the user reads before signing, never a block.
import type { TokenRisk } from '../../services/intentService'
import { C } from './shared'

export function TokenRiskNotice({ risk }: { risk: TokenRisk }) {
  const danger = risk.level === 'danger'
  return (
    <div
      role="alert"
      style={{
        border: `1px solid ${danger ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'}`,
        background: danger ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
        borderRadius: 14,
        padding: '0.75rem 0.9rem',
        marginBottom: '0.9rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: C.max }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2.2 14.5 13.5h-13L8 2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 6.5v3.2M8 11.6v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {danger ? `High risk: ${risk.symbol} shows signs of a scam token` : `Check ${risk.symbol} before you buy`}
      </div>
      <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1.1rem', listStyle: 'disc', fontSize: '0.72rem', lineHeight: 1.6, color: C.label }}>
        {risk.flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
      <div style={{ marginTop: '0.4rem', fontSize: '0.64rem', color: C.muted }}>
        Reported by {risk.source}. A warning, not a guarantee either way.
      </div>
    </div>
  )
}
