// src/components/app/WalletPanelContent.tsx
import React from 'react'
import { C, displayFont, Icon, PulseDot } from './shared'

interface WalletPanelContentProps {
  isConnected: boolean
  address?: string
  balance: string
  chainName: string
  connect: () => void
  disconnect: () => void
}

export function WalletPanelContent({
  isConnected,
  address,
  balance,
  chainName,
  connect,
  disconnect,
}: WalletPanelContentProps) {
  if (!isConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.65, margin: 0 }}>
          Connect your wallet to start executing cross-chain transactions. No account
          required.
        </p>
        <button
          onClick={connect}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: C.max,
            color: C.bg,
            border: 'none',
            borderRadius: 6,
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Connect Wallet
        </button>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.65rem 0.75rem',
            border: `1px solid ${C.border}`,
            borderRadius: 5,
            fontSize: '0.72rem',
            color: C.muted,
            lineHeight: 1.5,
          }}
        >
          <Icon.Shield size={13} />
          Non-custodial. Your keys stay in your wallet.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: C.surface2,
            border: `1px solid ${C.mid}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: C.muted,
          }}
        >
          ◈
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: C.label }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div style={{ fontSize: '0.65rem', color: C.muted }}>
            Connected • {chainName}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span
          style={{
            ...displayFont,
            fontSize: '1.6rem',
            fontWeight: 700,
            color: C.max,
            letterSpacing: '-0.03em',
          }}
        >
          {parseFloat(balance || '0').toFixed(4)}
        </span>
        <span style={{ fontSize: '0.75rem', color: C.muted }}>{chainName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            fontSize: '0.65rem',
            color: C.body,
          }}
        >
          <PulseDot connected size={6} />
          {chainName}
        </div>
        <button
          onClick={disconnect}
          style={{
            marginLeft: 'auto',
            fontSize: '0.62rem',
            color: C.muted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}