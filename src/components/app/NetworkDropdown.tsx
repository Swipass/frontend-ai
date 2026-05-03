// src/components/app/NetworkDropdown.tsx
import React from 'react'
import { C, PulseDot } from './shared'

interface NetworkDropdownProps {
  open: boolean
  chains: string[]
  displayChains: string[]
  fromChainIdx: number
  onSelect: (idx: number) => void
  mobile?: boolean
}

export function NetworkDropdown({
  open,
  chains,
  displayChains,
  fromChainIdx,
  onSelect,
  mobile = false,
}: NetworkDropdownProps) {
  if (!open || chains.length === 0) return null

  return (
    <div
      style={{
        position: mobile ? 'fixed' : 'absolute',
        ...(mobile
          ? {
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: '16px 16px 0 0',
              maxHeight: '60vh',
              overflowY: 'auto',
            }
          : {
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 180,
              borderRadius: 8,
            }),
        background: C.panel,
        border: `1px solid ${C.border}`,
        zIndex: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {mobile && (
        <div
          style={{
            height: 4,
            width: 40,
            background: C.mid,
            borderRadius: 2,
            margin: '0.75rem auto 0.5rem',
          }}
        />
      )}
      {displayChains.map((chain, idx) => (
        <button
          key={chain}
          onClick={() => onSelect(idx)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.7rem 1rem',
            width: '100%',
            border: 'none',
            borderBottom: `1px solid ${C.border}`,
            background: fromChainIdx === idx ? C.surface : 'none',
            color: fromChainIdx === idx ? C.max : C.body,
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
            textAlign: 'left',
          }}
        >
          <PulseDot connected={fromChainIdx === idx} />
          {chain}
        </button>
      ))}
    </div>
  )
}