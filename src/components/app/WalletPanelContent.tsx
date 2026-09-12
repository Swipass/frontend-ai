// src/components/app/WalletPanelContent.tsx
import { Icon, PulseDot } from './shared'

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
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">
          Connect a wallet to start executing cross-chain transactions. No account required.
        </p>
        <button type="button" onClick={connect} className="pill pill-light h-12 w-full">
          Connect wallet
        </button>
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-[0.78rem] leading-relaxed text-[color:var(--ink-3)]">
          <span className="shrink-0">
            <Icon.Shield size={14} />
          </span>
          Non-custodial. Your keys stay in your wallet.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_30%,#f5f5f5,#6b6b6b_55%,#1a1a1a)]"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <div className="f-mono text-[0.84rem] text-[color:var(--ink)]">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="text-[0.74rem] text-[color:var(--ink-4)]">Connected · {chainName}</div>
        </div>
      </div>
      <div>
        <div className="kicker mb-1.5">Balance</div>
        <div className="flex items-baseline gap-2">
          <span className="text-[2.2rem] font-light leading-none tracking-[-0.045em] text-[color:var(--ink)]">
            {parseFloat(balance || '0').toFixed(4)}
          </span>
          <span className="text-[0.8rem] text-[color:var(--ink-3)]">{chainName}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip text-[0.74rem]">
          <PulseDot connected size={6} />
          {chainName}
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="ml-auto text-[0.76rem] text-[color:var(--ink-4)] transition-colors hover:text-[color:var(--ink)]"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
