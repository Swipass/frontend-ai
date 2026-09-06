// src/components/app/SuccessModal.tsx
import { C, displayFont, Icon } from './shared'

interface SuccessModalProps {
  open: boolean
  txHash: string
  explorerUrl: string
  isMobile: boolean
  onClose: () => void
}

export function SuccessModal({ open, txHash, explorerUrl, isMobile, onClose }: SuccessModalProps) {
  if (!open) return null

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,10,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            border: `1.5px solid ${C.muted}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.label,
          }}
        >
          <Icon.Check size={24} />
        </div>
        <div
          style={{
            ...displayFont,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: C.max,
            letterSpacing: '-0.02em',
          }}
        >
          Transaction Settled
        </div>
        <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
          Your assets have been successfully bridged. The destination address will reflect the
          balance after on-chain confirmation.
        </p>
        <div
          style={{
            padding: '0.6rem 0.85rem',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 5,
            fontSize: '0.68rem',
            color: C.muted,
            wordBreak: 'break-all',
            textAlign: 'left',
            width: '100%',
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {txHash.slice(0, 20)}...{txHash.slice(-8)}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button onClick={onClose} className="sw-btn sw-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
            New Command
          </button>
          <a
            href={`${explorerUrl}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sw-btn sw-btn-primary"
            style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  )
}
