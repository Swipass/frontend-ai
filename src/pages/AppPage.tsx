// src/pages/AppPage.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { intentService, IntentResponse, QuoteResponse } from '../services/intentService'
import { useAppStore } from '../store/appStore'
import { useWallet } from '../hooks/useWallet'
import { useVoiceInput } from '../hooks/useVoiceInput'

// ─── Constants ────────────────────────────────────────────────
const QUICK_COMMANDS = [
  'Bridge 1 ETH from Ethereum to Polygon',
  'Send 50 DAI from Base to Optimism',
  'Bridge 0.5 ETH from Ethereum to Avalanche',
]

const EXPLORERS: Record<number, string> = {
  1:     'https://etherscan.io/tx/',
  42161: 'https://arbiscan.io/tx/',
  8453:  'https://basescan.org/tx/',
  10:    'https://optimistic.etherscan.io/tx/',
  137:   'https://polygonscan.com/tx/',
  43114: 'https://snowtrace.io/tx/',
  56:    'https://bscscan.com/tx/',
  100:   'https://gnosisscan.io/tx/',
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Mobile tab options ───────────────────────────────────────
type MobileTab = 'command' | 'preview' | 'history'

// ─── Shared CSS tokens (matches index.css vars) ───────────────
const C = {
  bg:       'var(--gray-50)',
  panel:    'var(--gray-100)',
  surface:  'var(--gray-200)',
  surface2: 'var(--gray-300)',
  border:   'var(--gray-300)',
  mid:      'var(--gray-400)',
  muted:    'var(--gray-500)',
  body:     'var(--gray-600)',
  label:    'var(--gray-700)',
  hi:       'var(--gray-800)',
  max:      'var(--gray-900)',
  white:    'var(--gray-50)',
} as const

// ─── Tiny reusable style helpers ─────────────────────────────
const monoSm: React.CSSProperties = { fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', letterSpacing: '0.06em' }
const displayFont: React.CSSProperties = { fontFamily: "'Syne',sans-serif" }
const uppercaseLabel: React.CSSProperties = { ...monoSm, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, fontSize: '0.6rem' }
const borderBottom: React.CSSProperties = { borderBottom: `1px solid ${C.border}` }

// ─── Spinner ──────────────────────────────────────────────────
function Spinner({ size = 14, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{
      width: size, height: size,
      border: `1.5px solid ${light ? 'rgba(245,245,245,0.25)' : 'rgba(100,100,100,0.3)'}`,
      borderTopColor: light ? C.max : C.label,
      borderRadius: '50%',
    }} className="spinner" />
  )
}

// ─── Icon set (inline SVG, no dep) ────────────────────────────
const Icon = {
  Mic: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  ),
  Check: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Arrow: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  Clock: ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  ChevronDown: ({ size = 10 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Shield: ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  Grid: ({ size = 11 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Warning: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  Close: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  Command: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  Eye: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  Swap: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  Wallet: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
  ),
}

// ─── Pulse dot ────────────────────────────────────────────────
function PulseDot({ connected = false, size = 6 }: { connected?: boolean; size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: connected ? C.body : C.muted,
      flexShrink: 0,
      ...(connected ? { animation: 'pulseDot 2s ease-in-out infinite' } : {}),
    }} />
  )
}

// ─── Mobile Bottom Sheet ──────────────────────────────────────
function BottomSheet({
  open, onClose, title, children, maxHeight = '88vh',
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxHeight?: string
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', zIndex: 400,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.3s',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: C.panel,
        borderTop: `1px solid ${C.border}`,
        borderRadius: '16px 16px 0 0',
        zIndex: 401,
        maxHeight,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 1.25rem 0', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: C.mid, borderRadius: 2, marginBottom: '0.75rem' }} />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...borderBottom, paddingBottom: '0.75rem' }}>
            <span style={{ ...uppercaseLabel, fontSize: '0.65rem', letterSpacing: '0.14em' }}>{title}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Close size={16} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem 2rem' }}>
          {children}
        </div>
      </div>
    </>
  )
}

// ─── Network Dropdown ─────────────────────────────────────────
function NetworkDropdown({
  open, chains, displayChains, fromChainIdx, onSelect, mobile = false,
}: {
  open: boolean; chains: string[]; displayChains: string[]; fromChainIdx: number;
  onSelect: (idx: number) => void; mobile?: boolean
}) {
  if (!open || chains.length === 0) return null
  return (
    <div style={{
      position: mobile ? 'fixed' : 'absolute',
      ...(mobile ? { bottom: 0, left: 0, right: 0, borderRadius: '16px 16px 0 0', maxHeight: '60vh', overflowY: 'auto' } : { top: 'calc(100% + 8px)', right: 0, minWidth: 180, borderRadius: 8 }),
      background: C.panel, border: `1px solid ${C.border}`, zIndex: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    }}>
      {mobile && <div style={{ height: 4, width: 40, background: C.mid, borderRadius: 2, margin: '0.75rem auto 0.5rem' }} />}
      {displayChains.map((chain, idx) => (
        <button key={chain} onClick={() => onSelect(idx)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.7rem 1rem', width: '100%', border: 'none',
            borderBottom: `1px solid ${C.border}`,
            background: fromChainIdx === idx ? C.surface : 'none',
            color: fromChainIdx === idx ? C.max : C.body,
            fontFamily: "'DM Mono',monospace", fontSize: '0.78rem',
            cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left',
          }}>
          <PulseDot connected={fromChainIdx === idx} />
          {chain}
        </button>
      ))}
    </div>
  )
}

// ─── Wallet Panel Content (shared desktop + sheet) ────────────
function WalletPanelContent({
  isConnected, address, balance, chainName, connect, disconnect,
}: {
  isConnected: boolean; address?: string; balance: string; chainName: string;
  connect: () => void; disconnect: () => void
}) {
  if (!isConnected) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.65, margin: 0 }}>
        Connect your wallet to start executing cross-chain transactions. No account required.
      </p>
      <button onClick={connect}
        style={{ width: '100%', padding: '0.85rem', background: C.max, color: C.bg, border: 'none', borderRadius: 6, fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s' }}>
        Connect Wallet
      </button>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: '0.72rem', color: C.muted, lineHeight: 1.5 }}>
        <Icon.Shield size={13} />
        Non-custodial. Your keys stay in your wallet.
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.surface2, border: `1px solid ${C.mid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: C.muted, flexShrink: 0 }}>◈</div>
        <div>
          <div style={{ fontSize: '0.78rem', color: C.label }}>{address?.slice(0, 6)}...{address?.slice(-4)}</div>
          <div style={{ fontSize: '0.65rem', color: C.muted }}>via WalletConnect</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span style={{ ...displayFont, fontSize: '1.6rem', fontWeight: 700, color: C.max, letterSpacing: '-0.03em' }}>{parseFloat(balance || '0').toFixed(4)}</span>
        <span style={{ fontSize: '0.75rem', color: C.muted }}>{chainName === 'Ethereum' ? 'ETH' : chainName === 'BNB Chain' ? 'BNB' : chainName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: '0.65rem', color: C.body }}>
          <PulseDot connected size={6} />
          {chainName}
        </div>
        <button onClick={disconnect}
          style={{ fontSize: '0.62rem', color: C.muted, background: 'none', border: 'none', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', marginLeft: 'auto', padding: 0, transition: 'color 0.2s' }}>
          Disconnect
        </button>
      </div>
    </div>
  )
}

// ─── Transaction Preview Content (shared desktop + sheet) ──────
function TxPreviewContent({
  result, displayChains,
}: {
  result: IntentResponse | null; displayChains: string[]
}) {
  if (!result) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1rem 0', color: C.mid, textAlign: 'center' }}>
        <div style={{ opacity: 0.25 }}><Icon.Arrow size={36} /></div>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, color: C.muted }}>Execute a command to see your transaction details here</p>
      </div>
      <div>
        <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', paddingBottom: '0.4rem', ...borderBottom, display: 'block' }}>Supported Chains</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          {displayChains.map(c => (
            <div key={c} style={{ padding: '0.4rem 0.6rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, fontSize: '0.68rem', color: C.body, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.muted }} />{c}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', paddingBottom: '0.4rem', ...borderBottom, display: 'block' }}>Fee Structure</div>
        {[['Direct use fee', '0.10%'], ['Via developer app', '0.15%'], ['Gas estimate', '~$2–8']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0', ...borderBottom }}>
            <span style={{ color: C.muted }}>{l}</span>
            <span style={{ color: C.label }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '1rem', ...borderBottom, marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...uppercaseLabel, marginBottom: '0.25rem', display: 'block' }}>You Send</div>
          <div style={{ ...displayFont, fontSize: '1.35rem', fontWeight: 700, color: C.max, letterSpacing: '-0.02em' }}>{result.quote.from_amount}</div>
          <div style={{ fontSize: '0.75rem', color: C.body }}>{result.quote.from_token}</div>
          <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 2 }}>on {result.quote.from_chain}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', padding: '0 0.6rem', color: C.mid }}>
          <div style={{ width: 32, height: 1, background: C.mid, position: 'relative' }}>
            <span style={{ position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)', fontSize: '0.35rem' }}>▶</span>
          </div>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, textAlign: 'center' }}>via {result.selected_provider}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ ...uppercaseLabel, marginBottom: '0.25rem', display: 'block', textAlign: 'right' }}>You Receive</div>
          <div style={{ ...displayFont, fontSize: '1.35rem', fontWeight: 700, color: C.max, letterSpacing: '-0.02em' }}>{parseFloat(result.quote.to_amount).toFixed(4)}</div>
          <div style={{ fontSize: '0.75rem', color: C.body }}>{result.quote.to_token}</div>
          <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 2 }}>on {result.quote.to_chain}</div>
        </div>
      </div>

      {/* Detail rows */}
      {[
        ['Platform fee', `${result.quote.fee_amount} ${result.quote.fee_token} (0.10%)`],
        ['Est. gas', `~$${result.quote.estimated_gas_usd}`],
        ['Est. time', `~${result.quote.estimated_time_seconds}s`],
        ['Provider', result.selected_provider],
        ['Route score', `${result.quote.score.toFixed(1)} / 100`],
      ].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', ...borderBottom, fontSize: '0.75rem' }}>
          <span style={{ color: C.muted }}>{l}</span>
          <span style={{ color: l === 'Provider' ? C.max : C.label, fontFamily: "'DM Mono',monospace" }}>{v}</span>
        </div>
      ))}

      {/* Destination */}
      <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.75rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6 }}>
        <div style={{ ...uppercaseLabel, marginBottom: '0.3rem', display: 'block' }}>Destination</div>
        <div style={{ fontSize: '0.72rem', color: result.destination_address ? C.label : C.muted, fontStyle: result.destination_address ? 'normal' : 'italic', wordBreak: 'break-all' }}>
          {result.destination_note}
        </div>
      </div>
    </div>
  )
}

// ─── History Panel Content (shared desktop + sheet) ────────────
function HistoryContent({ commandHistory }: { commandHistory: any[] }) {
  if (commandHistory.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem 1.5rem', color: C.mid, textAlign: 'center' }}>
      <div style={{ opacity: 0.3 }}><Icon.Clock size={32} /></div>
      <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, color: C.muted }}>Your command history<br />will appear here</p>
    </div>
  )

  return (
    <>
      {commandHistory.map((item, i) => (
        <div key={item.id} style={{
          padding: '0.9rem 0', borderBottom: `1px solid ${C.border}`,
          borderLeft: i === 0 ? `2px solid ${C.label}` : '2px solid transparent',
          paddingLeft: '0.75rem', transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
            {item.fromChain && <span style={{ padding: '0.1rem 0.4rem', background: C.surface2, borderRadius: 3, fontSize: '0.62rem', color: C.body }}>{item.fromChain}</span>}
            {item.toChain && <>
              <span style={{ color: C.mid, fontSize: '0.6rem' }}>→</span>
              <span style={{ padding: '0.1rem 0.4rem', background: C.surface2, borderRadius: 3, fontSize: '0.62rem', color: C.body }}>{item.toChain}</span>
            </>}
          </div>
          <div style={{ fontSize: '0.78rem', color: C.label, lineHeight: 1.4, marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.command}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase',
              color: item.status === 'completed' ? C.body : item.status === 'failed' ? C.mid : C.muted,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                background: item.status === 'completed' ? C.body : item.status === 'failed' ? C.mid : C.muted,
                ...(item.status === 'pending' ? { animation: 'pulseDot 1.5s infinite' } : {}),
              }} />
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Provider Comparison Table ─────────────────────────────────
function ProviderTable({ result }: { result: IntentResponse }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', display: 'block', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Provider Quotes — Best Selected</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 0.7fr 1fr', padding: '0.5rem 1rem', background: C.surface, fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, ...borderBottom }}>
          {['Provider', 'Output', 'Time', 'Score', 'Status'].map(h => <span key={h}>{h}</span>)}
        </div>
        {result.all_quotes.map((q: QuoteResponse, i: number) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 0.7fr 1fr',
            padding: '0.65rem 1rem', borderBottom: i < result.all_quotes.length - 1 ? `1px solid ${C.border}` : 'none',
            background: i === 0 ? C.surface : C.panel,
            fontSize: '0.7rem', alignItems: 'center', transition: 'background 0.2s',
          }}>
            <span style={{ color: i === 0 ? C.max : C.muted, fontWeight: i === 0 ? 600 : 400 }}>{q.provider}</span>
            <span style={{ color: i === 0 ? C.max : C.muted, fontFamily: "'DM Mono',monospace", fontSize: '0.68rem' }}>
              {parseFloat(q.to_amount).toFixed(4)} {q.to_token}
            </span>
            <span style={{ color: C.muted, fontSize: '0.65rem' }}>~{q.estimated_time_seconds}s</span>
            <span>
              <div style={{ display: 'inline-flex', padding: '0.12rem 0.45rem', background: i === 0 ? C.mid : C.surface2, borderRadius: 3, fontSize: '0.6rem', color: i === 0 ? C.max : C.body }}>
                {q.score.toFixed(1)}
              </div>
            </span>
            {i === 0
              ? <span><div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.12rem 0.45rem', background: C.mid, borderRadius: 3, fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.max }}>✓ Best</div></span>
              : <span />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Confirm Button ───────────────────────────────────────────
function ConfirmButton({
  result, isConfirming, isSending, isWaiting, onConfirm,
}: {
  result: IntentResponse | null; isConfirming: boolean; isSending: boolean; isWaiting: boolean; onConfirm: () => void
}) {
  if (!result) return null
  const label = isSending ? 'Awaiting wallet...' : isWaiting ? 'Confirming on-chain...' : isConfirming ? 'Processing...' : '✓ Confirm & Sign'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.75rem' }}>
      <button onClick={onConfirm} disabled={isConfirming}
        style={{ width: '100%', padding: '0.9rem', background: isConfirming ? C.mid : C.max, color: isConfirming ? C.muted : C.bg, border: 'none', borderRadius: 8, fontFamily: "'DM Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: isConfirming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.3s' }}>
        {isConfirming && <Spinner size={14} light />}
        {label}
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.65rem', color: C.muted, lineHeight: 1.5, margin: 0 }}>
        Review in your wallet. Transaction broadcast after signature.
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.6rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: '0.68rem', color: C.muted, lineHeight: 1.5 }}>
        <Icon.Warning size={12} />
        Simulation passed. You are signing a real on-chain transaction.
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function AppPage() {
  const { commandHistory, addCommand, updateCommand } = useAppStore()
  const { address, isConnected, chainName, balance, connect, disconnect, chainId } = useWallet()

  const [command, setCommand]             = useState('')
  const [loading, setLoading]             = useState(false)
  const [result, setResult]               = useState<IntentResponse | null>(null)
  const [showSuccess, setShowSuccess]     = useState(false)
  const [txHash, setTxHash]               = useState('')
  const [confirming, setConfirming]       = useState(false)
  const [fromChainIdx, setFromChainIdx]   = useState(0)
  const [networkDropdown, setNetworkDropdown] = useState(false)
  const [destAddress, setDestAddress]     = useState('')
  const [showDestInput, setShowDestInput] = useState(false)
  const [histId, setHistId]               = useState<string | null>(null)
  const [chains, setChains]               = useState<string[]>([])
  const [chainsLoading, setChainsLoading] = useState(true)

  // Mobile-specific state
  const [mobileTab, setMobileTab]         = useState<MobileTab>('command')
  const [sheetWallet, setSheetWallet]     = useState(false)
  const [sheetHistory, setSheetHistory]   = useState(false)
  const [sheetNetwork, setSheetNetwork]   = useState(false)
  const [isMobile, setIsMobile]           = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isRecording, transcript, error: voiceError, startRecording, stopRecording } = useVoiceInput()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const { data: receipt, isLoading: isWaiting, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fetch chains
  useEffect(() => {
    intentService.getChains()
      .then(data => { setChains(data); setChainsLoading(false) })
      .catch(() => {
        setChains(['ethereum', 'arbitrum', 'base', 'optimism', 'polygon', 'avalanche', 'bnb', 'gnosis'])
        setChainsLoading(false)
      })
  }, [])

  useEffect(() => { if (voiceError) toast.error(`Voice: ${voiceError}`) }, [voiceError])
  useEffect(() => { if (transcript) setCommand(transcript) }, [transcript])

  useEffect(() => {
    if (txSuccess && receipt && histId) {
      setShowSuccess(true)
      updateCommand(histId, { status: 'completed', txHash: receipt.transactionHash })
      toast.success('Transaction settled!')
      setConfirming(false)
    }
  }, [txSuccess, receipt, histId, updateCommand])

  const handleSubmit = useCallback(async () => {
    if (!command.trim() || loading || chainsLoading) return
    setLoading(true)
    setResult(null)
    if (isMobile) setMobileTab('command') // stay on command tab during loading

    const fromChainDisplay = chains[fromChainIdx] || 'ethereum'
    const id = addCommand({ command: command.trim(), fromChain: capitalize(fromChainDisplay), toChain: '', status: 'pending' })
    setHistId(id)

    try {
      const res = await intentService.execute({
        command: command.trim(),
        destination_address: destAddress || undefined,
        from_chain_hint: fromChainDisplay.toLowerCase(),
        wallet_address: address || undefined,
      })
      setResult(res)
      updateCommand(id, { toChain: res.parsed_intent.to_chain || '', status: 'pending' })
      // Auto-switch to preview on mobile after result
      if (isMobile) setTimeout(() => setMobileTab('preview'), 300)
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse intent')
      updateCommand(id, { status: 'failed' })
    } finally {
      setLoading(false)
    }
  }, [command, loading, chainsLoading, chains, fromChainIdx, destAddress, address, isMobile, addCommand, updateCommand])

  const handleConfirm = async () => {
    if (!result || !address) { toast.error('Wallet not connected'); return }
    const tx = result.transaction
    if (!tx?.to) { toast.error('Invalid transaction data'); return }
    if (chainId !== tx.chain_id) {
      toast.error(`Switch wallet to ${tx.chain_name || 'required chain'} (Chain ID: ${tx.chain_id})`); return
    }
    setConfirming(true)
    try {
      let value: bigint
      try { value = parseEther(tx.value || '0') } catch { value = parseUnits(tx.value || '0', 18) }
      const hash = await sendTransactionAsync({ to: tx.to as `0x${string}`, data: tx.data as `0x${string}`, value, gas: tx.gas_limit ? BigInt(tx.gas_limit) : undefined })
      setTxHash(hash)
      toast.loading('Transaction broadcasted. Waiting for confirmation...', { id: 'tx' })
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed')
      setConfirming(false)
      if (histId) updateCommand(histId, { status: 'failed' })
    }
  }

  const closeSuccess = () => {
    setShowSuccess(false); setResult(null); setCommand('')
    setDestAddress(''); setShowDestInput(false); setTxHash('')
  }

  const toggleRecording = () => { isRecording ? stopRecording() : startRecording() }

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit() }
      if (e.key === 'Escape') { setShowSuccess(false); setNetworkDropdown(false); setSheetWallet(false); setSheetHistory(false); setSheetNetwork(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); textareaRef.current?.focus() }
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [handleSubmit])

  const displayChains = chains.map(c => capitalize(c))
  const totalVolume = commandHistory.filter(c => c.status === 'completed').reduce((s, c) => s + (c.volumeUsd || 0), 0)
  const isConfirming = confirming || isSending || isWaiting
  const explorerUrl = result?.quote?.chain_id ? EXPLORERS[result.quote.chain_id] : 'https://etherscan.io/tx/'

  // ─── Shared: command card content ──────────────────────────
  const CommandCard = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Status banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', opacity: isConnected ? 1 : 0.7, transition: 'opacity 0.4s' }}>
        <PulseDot connected={isConnected} />
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>
          {isConnected ? `Connected (${balance} ${chainName}) — Ready` : 'Connect wallet to begin'}
        </span>
      </div>

      {/* Input card */}
      <div style={{
        background: C.panel, border: `1px solid ${loading ? C.muted : result ? C.body : C.border}`,
        borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: result ? `0 0 0 3px rgba(102,102,102,0.08)` : 'none',
      }}>
        {/* Top row: voice + textarea */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '1rem 1rem 0' }}>
          <button onClick={toggleRecording}
            style={{ width: 40, height: 40, border: `1px solid ${isRecording ? C.body : C.border}`, borderRadius: 8, background: isRecording ? C.mid : C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: isRecording ? C.max : C.muted, transition: 'all 0.3s' }}>
            <Icon.Mic size={16} />
          </button>
          <div style={{ flex: 1, padding: '0 0.75rem' }}>
            <textarea
              ref={textareaRef}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder={isMobile ? 'Speak or type a command...' : 'Send 50 USDC from Arbitrum to Base...'}
              rows={isMobile ? 3 : 3}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: "'DM Mono',monospace", fontSize: isMobile ? '0.95rem' : '0.9rem', color: C.hi, lineHeight: 1.6, minHeight: 72, caretColor: C.label }}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
            />
          </div>
        </div>

        {/* Dest address toggle */}
        <div style={{ padding: '0 1rem 0.5rem', paddingLeft: 'calc(1rem + 40px + 0.75rem)' }}>
          <button onClick={() => setShowDestInput(!showDestInput)}
            style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mid, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono',monospace", padding: 0 }}>
            {showDestInput ? '− Hide' : '+ Custom destination address'}
          </button>
          {showDestInput && (
            <input
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              placeholder="0x... destination address (optional)"
              style={{ display: 'block', width: '100%', marginTop: '0.5rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: '0.45rem 0.75rem', fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: C.body, outline: 'none' }}
            />
          )}
        </div>

        {/* Toolbar */}
        <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            {/* From chain selector */}
            <button
              onClick={() => isMobile ? setSheetNetwork(true) : setNetworkDropdown(!networkDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: '0.68rem', color: C.body, cursor: 'pointer', transition: 'all 0.3s', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
              <Icon.Swap size={10} />
              {isMobile ? (displayChains[fromChainIdx] || 'Chain') : `From: ${displayChains[fromChainIdx] || 'Loading...'}`}
            </button>
            {!isMobile && <span style={{ fontSize: '0.62rem', color: C.mid }}>⌘↵ to send</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!command.trim() || loading || chainsLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: isMobile ? '0.55rem 1.1rem' : '0.5rem 1.25rem', background: !command.trim() || loading || chainsLoading ? C.mid : C.max, color: !command.trim() || loading || chainsLoading ? C.muted : C.bg, border: 'none', borderRadius: 6, fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {loading ? <><Spinner size={13} light /> Processing</> : 'Execute'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <div style={{ width: '100%', height: '100%', border: `1px solid ${C.muted}`, borderTopColor: C.hi, borderRadius: '50%' }} className="spinner" />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, background: C.body, borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: C.muted }}>Processing your command...</div>
        </div>
      )}

      {/* Provider comparison */}
      {result && !loading && <ProviderTable result={result} />}

      {/* Mobile: confirm button inline on command tab */}
      {result && !loading && isMobile && (
        <ConfirmButton result={result} isConfirming={isConfirming} isSending={isSending} isWaiting={isWaiting} onConfirm={handleConfirm} />
      )}

      {/* Quick commands */}
      {!loading && !result && (
        <div>
          <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', display: 'block' }}>Quick Commands</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {QUICK_COMMANDS.map((c, i) => (
              <button key={i} onClick={() => setCommand(c)}
                style={{ padding: '0.4rem 0.8rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 40, fontSize: '0.72rem', color: C.muted, cursor: 'pointer', transition: 'all 0.3s', fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = C.surface)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ─── Desktop: network dropdown (positioned) ─────────────────
  const DesktopNetworkDropdown = !isMobile && networkDropdown ? (
    <div onClick={() => setNetworkDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 198 }} />
  ) : null

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { animation: spin 0.7s linear infinite; }
        @media (max-width: 767px) {
          body { cursor: auto !important; }
          #cursor-dot, #cursor-ring { display: none !important; }
        }
      `}</style>

      {/* ── Success overlay ── */}
      {showSuccess && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeSuccess() }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: '1rem' }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem', maxWidth: 400, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 56, height: 56, border: `1.5px solid ${C.muted}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.label }}>
              <Icon.Check size={24} />
            </div>
            <div style={{ ...displayFont, fontSize: '1.5rem', fontWeight: 700, color: C.max, letterSpacing: '-0.02em' }}>Transaction Settled</div>
            <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>Your assets have been successfully bridged. The destination address will reflect the balance after on-chain confirmation.</p>
            <div style={{ padding: '0.6rem 0.85rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, fontSize: '0.68rem', color: C.muted, wordBreak: 'break-all', textAlign: 'left', width: '100%', fontFamily: "'DM Mono',monospace" }}>
              {txHash.slice(0, 20)}...{txHash.slice(-8)}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button onClick={closeSuccess} className="sw-btn sw-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>New Command</button>
              <a href={`${explorerUrl}${txHash}`} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn-primary" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>View on Explorer</a>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop network dropdown backdrop ── */}
      {DesktopNetworkDropdown}

      {/* ══════════════════════════════════════════════════════════
          MOBILE LAYOUT  (< 768px)
          ══════════════════════════════════════════════════════════ */}
      {isMobile ? (
        <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' }}>

          {/* Mobile top bar */}
          <header style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '0 1rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 100 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', ...displayFont, fontSize: '0.95rem', fontWeight: 800, color: C.max, letterSpacing: '-0.03em', textDecoration: 'none' }}>
              Swipass
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Wallet status pill */}
              <button
                onClick={() => setSheetWallet(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 40, background: 'none', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', color: isConnected ? C.body : C.muted, transition: 'all 0.2s' }}>
                <PulseDot connected={isConnected} />
                {isConnected ? `${address?.slice(0, 4)}...${address?.slice(-3)}` : 'Wallet'}
              </button>

              {/* Network pill */}
              <button
                onClick={() => setSheetNetwork(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.6rem', border: `1px solid ${C.border}`, borderRadius: 40, background: 'none', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', color: C.muted }}>
                {displayChains[fromChainIdx]?.slice(0, 3) || '...'}
                <Icon.ChevronDown size={9} />
              </button>
            </div>
          </header>

          {/* Mobile tab content */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>

            {/* dot-grid background */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.2, pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '1.25rem 1rem', paddingBottom: '5rem' }}>

              {/* Command tab */}
              {mobileTab === 'command' && CommandCard}

              {/* Preview tab */}
              {mobileTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <TxPreviewContent result={result} displayChains={displayChains} />
                  {result && (
                    <ConfirmButton result={result} isConfirming={isConfirming} isSending={isSending} isWaiting={isWaiting} onConfirm={handleConfirm} />
                  )}
                </div>
              )}

              {/* History tab */}
              {mobileTab === 'history' && (
                <div>
                  {/* Session stats */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    {[
                      { val: `$${totalVolume.toFixed(0)}`, lbl: 'Volume' },
                      { val: commandHistory.filter(c => c.status === 'completed').length, lbl: 'Settled' },
                      { val: commandHistory.length, lbl: 'Total' },
                    ].map(s => (
                      <div key={s.lbl} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ ...displayFont, fontSize: '1.1rem', fontWeight: 700, color: C.hi, letterSpacing: '-0.02em' }}>{s.val}</div>
                        <div style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <HistoryContent commandHistory={commandHistory} />
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile bottom tab bar ── */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: C.panel, borderTop: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'stretch',
            zIndex: 200,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {([
              { id: 'command', label: 'Command', Icon: Icon.Command },
              { id: 'preview', label: 'Preview', Icon: Icon.Eye, badge: result ? '!' : null },
              { id: 'history', label: 'History', Icon: Icon.Clock, badge: commandHistory.length > 0 ? commandHistory.length : null },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem', padding: '0.6rem 0', border: 'none', background: 'none', cursor: 'pointer',
                  color: mobileTab === tab.id ? C.max : C.muted,
                  borderTop: `2px solid ${mobileTab === tab.id ? C.max : 'transparent'}`,
                  transition: 'all 0.2s', position: 'relative',
                }}>
                <tab.Icon size={18} />
                <span style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace" }}>
                  {tab.label}
                </span>
                {tab.badge && (
                  <div style={{ position: 'absolute', top: 6, right: 'calc(50% - 16px)', background: C.mid, color: C.max, borderRadius: 10, fontSize: '0.5rem', padding: '0.05rem 0.35rem', minWidth: 14, textAlign: 'center', fontFamily: "'DM Mono',monospace" }}>
                    {tab.badge}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ── Mobile bottom sheets ── */}

          {/* Wallet sheet */}
          <BottomSheet open={sheetWallet} onClose={() => setSheetWallet(false)} title="Wallet" maxHeight="70vh">
            <WalletPanelContent isConnected={isConnected} address={address} balance={balance} chainName={chainName} connect={() => { connect(); setSheetWallet(false) }} disconnect={() => { disconnect(); setSheetWallet(false) }} />
          </BottomSheet>

          {/* Network sheet */}
          <BottomSheet open={sheetNetwork} onClose={() => setSheetNetwork(false)} title="Select Network" maxHeight="75vh">
            {displayChains.map((chain, idx) => (
              <button key={chain} onClick={() => { setFromChainIdx(idx); setSheetNetwork(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 0', width: '100%', border: 'none', borderBottom: `1px solid ${C.border}`, background: 'none', color: fromChainIdx === idx ? C.max : C.body, fontFamily: "'DM Mono',monospace", fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                <PulseDot connected={fromChainIdx === idx} size={7} />
                {chain}
                {fromChainIdx === idx && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected</span>}
              </button>
            ))}
          </BottomSheet>

          {/* History sheet (accessible via tab, but also from header if needed) */}
          <BottomSheet open={sheetHistory} onClose={() => setSheetHistory(false)} title={`History (${commandHistory.length})`} maxHeight="85vh">
            <HistoryContent commandHistory={commandHistory} />
          </BottomSheet>
        </div>

      ) : (

        /* ══════════════════════════════════════════════════════════
           DESKTOP LAYOUT  (≥ 768px)
           ══════════════════════════════════════════════════════════ */
        <div style={{ height: '100vh', overflow: 'hidden', display: 'grid', gridTemplateRows: '56px 1fr', gridTemplateColumns: '260px 1fr 320px', background: C.bg, fontFamily: "'DM Mono',monospace" }}
          onClick={() => setNetworkDropdown(false)}>

          {/* ── Desktop Top Bar ── */}
          <header style={{ gridColumn: '1/-1', gridRow: 1, background: C.panel, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...displayFont, fontSize: '1rem', fontWeight: 800, color: C.max, letterSpacing: '-0.03em', textDecoration: 'none' }}>
                Swipass
              </Link>
              <nav style={{ display: 'flex', gap: 0, borderLeft: `1px solid ${C.border}`, paddingLeft: '1.5rem' }}>
                {[['App', '/app'], ['Dashboard', '/dashboard'], ['Docs', '/docs']].map(([label, href]) => (
                  <Link key={label} to={href}
                    style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: href === '/app' ? C.max : C.muted, padding: '0.3rem 0.75rem', borderRadius: 3, background: href === '/app' ? C.surface2 : 'transparent', transition: 'all 0.3s', textDecoration: 'none' }}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Network pill */}
              <div style={{ position: 'relative' }}>
                <button onClick={e => { e.stopPropagation(); setNetworkDropdown(!networkDropdown) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 40, fontSize: '0.7rem', color: C.body, background: 'none', cursor: 'pointer', transition: 'all 0.3s', fontFamily: "'DM Mono',monospace" }}>
                  <PulseDot connected={isConnected} />
                  {isConnected ? chainName : 'Select Network'}
                  <Icon.ChevronDown size={10} />
                </button>
                {networkDropdown && !chainsLoading && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 180, zIndex: 200, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    {displayChains.map((chain, idx) => (
                      <button key={chain} onClick={() => { setFromChainIdx(idx); setNetworkDropdown(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', fontSize: '0.72rem', color: fromChainIdx === idx ? C.max : C.body, background: fromChainIdx === idx ? C.surface : 'none', width: '100%', border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: "'DM Mono',monospace", transition: 'background 0.2s' }}>
                        <PulseDot connected={fromChainIdx === idx} />
                        {chain}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Wallet button */}
              <button onClick={isConnected ? disconnect : connect}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: isConnected ? C.surface : C.max, color: isConnected ? C.label : C.bg, border: isConnected ? `1px solid ${C.border}` : 'none', borderRadius: 4, fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }}>
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
              </button>
              <Link to="/dashboard"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, padding: '0.4rem 0.75rem', border: `1px solid ${C.border}`, borderRadius: 4, transition: 'all 0.3s', textDecoration: 'none' }}>
                <Icon.Grid size={11} />
                Dashboard
              </Link>
            </div>
          </header>

          {/* ── Desktop Left Sidebar ── */}
          <aside style={{ gridColumn: 1, gridRow: 2, borderRight: `1px solid ${C.border}`, background: C.panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem 0.75rem', ...borderBottom, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ ...uppercaseLabel, fontSize: '0.65rem', letterSpacing: '0.14em' }}>Command History</span>
              <span style={{ background: C.surface2, color: C.body, fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: 10 }}>{commandHistory.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              <HistoryContent commandHistory={commandHistory} />
            </div>
            <div style={{ padding: '0.75rem 1.25rem', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[{ val: `$${totalVolume.toFixed(0)}`, lbl: 'Volume' }, { val: commandHistory.filter(c => c.status === 'completed').length, lbl: 'Settled' }, { val: commandHistory.length, lbl: 'Total' }].map(s => (
                  <div key={s.lbl} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ ...displayFont, fontSize: '0.95rem', fontWeight: 700, color: C.hi, letterSpacing: '-0.02em' }}>{s.val}</div>
                    <div style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Desktop Main Area ── */}
          <main
            style={{ gridColumn: 2, gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}
            onClick={() => setNetworkDropdown(false)}>
            {/* ambient glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(100,100,100,0.04) 0%, transparent 70%)', pointerEvents: 'none', animation: 'ambientPulse 6s ease-in-out infinite' }} />
            <style>{`@keyframes ambientPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            {/* dot grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.25, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1 }}>
              {CommandCard}
            </div>
          </main>

          {/* ── Desktop Right Panel ── */}
          <aside style={{ gridColumn: 3, gridRow: 2, borderLeft: `1px solid ${C.border}`, background: C.panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Wallet section */}
            <div style={{ flexShrink: 0, ...borderBottom }}>
              <div style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ ...uppercaseLabel, fontSize: '0.62rem', letterSpacing: '0.14em' }}>Wallet</span>
              </div>
              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <WalletPanelContent isConnected={isConnected} address={address} balance={balance} chainName={chainName} connect={connect} disconnect={disconnect} />
              </div>
            </div>

            {/* TX Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', ...borderBottom, flexShrink: 0 }}>
                <span style={{ ...uppercaseLabel, fontSize: '0.62rem', letterSpacing: '0.14em' }}>Transaction Preview</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
                <TxPreviewContent result={result} displayChains={displayChains} />
              </div>
              {result && (
                <div style={{ padding: '0 1.25rem 1.25rem', flexShrink: 0 }}>
                  <ConfirmButton result={result} isConfirming={isConfirming} isSending={isSending} isWaiting={isWaiting} onConfirm={handleConfirm} />
                </div>
              )}
            </div>
          </aside>

        </div>
      )}
    </>
  )
}