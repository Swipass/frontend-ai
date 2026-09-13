// src/components/app/SuccessModal.tsx
import type { ReactNode } from 'react'
import { Dialog } from '../Dialog'
import { Icon } from './shared'
import type { SettlementReceipt } from './settlement'

interface SuccessModalProps {
  open: boolean
  txHash: string
  explorerUrl: string
  isMobile: boolean
  receipt: SettlementReceipt | null
  onClose: () => void
}

function fmtAmount(value: string): string {
  const n = Number(value)
  if (!isFinite(n)) return value
  return n.toLocaleString(undefined, { maximumFractionDigits: Math.abs(n) < 1 ? 6 : 4 })
}

/**
 * Quoted vs. executed, in the open, every time this is knowable. This is the
 * receipt: Swipass's core promise made visible, not a buried analytics field.
 */
function Receipt({ receipt }: { receipt: SettlementReceipt }) {
  const variance = receipt.varianceBps
  const varianceGood = variance != null && variance >= 0
  const rows: [string, ReactNode][] = [
    ['Quoted', `${fmtAmount(receipt.quotedToAmount)} ${receipt.toToken}`],
    [
      'Executed',
      receipt.actualToAmount != null ? (
        `${fmtAmount(receipt.actualToAmount)} ${receipt.toToken}`
      ) : (
        <span className="text-[color:var(--ink-4)]">measuring...</span>
      ),
    ],
    [
      'Variance',
      variance != null ? (
        <span className={varianceGood ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-2)]'}>
          {variance > 0 ? '+' : ''}
          {variance} bps
        </span>
      ) : (
        <span className="text-[color:var(--ink-4)]">not yet known</span>
      ),
    ],
    ['Provider', receipt.provider],
    ['Simulation', receipt.simulationPassed ? 'Passed' : receipt.simulationReason || 'Unverified'],
    ['Settlement', receipt.settlement === 'confirmed' ? 'Confirmed' : 'Settling on destination'],
  ]
  return (
    <div className="f-mono relative mt-6 flex flex-col gap-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-1 text-left text-[0.78rem]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 last:border-b-0">
          <span className="text-[color:var(--ink-4)]">{label}</span>
          <span className="text-[color:var(--ink-2)]">{value}</span>
        </div>
      ))}
    </div>
  )
}

export function SuccessModal({ open, txHash, explorerUrl, isMobile, receipt, onClose }: SuccessModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Transaction settled"
      className={`glass max-w-[420px] overflow-hidden text-center ${isMobile ? 'px-6 py-9' : 'px-10 py-12'}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/[0.06] text-[color:var(--ink)] shadow-[0_0_40px_-6px_rgba(255,255,255,0.5)]">
        <Icon.Check size={26} />
      </div>
      <div className="kicker relative mt-7">Settled</div>
      <h2 className="relative mt-2 text-[2rem] font-light leading-tight tracking-[-0.04em] text-[color:var(--ink)]">
        Transaction <span className="f-serif italic">settled</span>
      </h2>
      <p className="relative mx-auto mt-3 max-w-xs text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">
        Your assets have been successfully bridged. The destination address will reflect the balance after on-chain
        confirmation.
      </p>

      {receipt && <Receipt receipt={receipt} />}

      <div className="f-mono relative mt-4 break-all rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-[0.74rem] text-[color:var(--ink-3)]">
        {txHash.slice(0, 20)}...{txHash.slice(-8)}
      </div>
      <div className="relative mt-5 flex gap-2.5">
        <button type="button" onClick={onClose} className="pill pill-dark flex-1">
          New command
        </button>
        <a href={`${explorerUrl}${txHash}`} target="_blank" rel="noopener noreferrer" className="pill pill-light flex-1">
          View on explorer <Icon.ArrowUpRight size={13} />
        </a>
      </div>
    </Dialog>
  )
}
