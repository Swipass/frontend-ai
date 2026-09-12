// src/components/app/SuccessModal.tsx
import { Icon } from './shared'

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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0a0a0a]/85 p-4 backdrop-blur-xl"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settled-title"
        className={`glass app-rise relative w-full max-w-[420px] overflow-hidden text-center ${isMobile ? 'px-6 py-9' : 'px-10 py-12'}`}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/[0.06] text-[color:var(--ink)] shadow-[0_0_40px_-6px_rgba(255,255,255,0.5)]">
          <Icon.Check size={26} />
        </div>
        <div className="kicker relative mt-7">Settled</div>
        <h2 id="settled-title" className="relative mt-2 text-[2rem] font-light leading-tight tracking-[-0.04em] text-[color:var(--ink)]">
          Transaction <span className="f-serif italic">settled</span>
        </h2>
        <p className="relative mx-auto mt-3 max-w-xs text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">
          Your assets have been successfully bridged. The destination address will reflect the balance after on-chain
          confirmation.
        </p>
        <div className="f-mono relative mt-6 break-all rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-[0.74rem] text-[color:var(--ink-3)]">
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
      </div>
    </div>
  )
}
