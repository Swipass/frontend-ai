// src/pages/AppPage.tsx
// Thin composition of the app command center. All state + the tx state machine
// live in useIntentExecution; layout lives in the AppLayout* components.
import { useIntentExecution } from '../components/app/useIntentExecution'
import { AppLayoutDesktop } from '../components/app/AppLayoutDesktop'
import { AppLayoutMobile } from '../components/app/AppLayoutMobile'
import { SuccessModal } from '../components/app/SuccessModal'
import { MOBILE_BREAKPOINT } from '../components/app/constants'

export default function AppPage() {
  const ctx = useIntentExecution()

  return (
    <>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { animation: spin 0.7s linear infinite; }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          body { cursor: auto !important; }
          #cursor-dot, #cursor-ring { display: none !important; }
        }
      `}</style>

      <SuccessModal
        open={ctx.showSuccess}
        txHash={ctx.txHash}
        explorerUrl={ctx.explorerUrl}
        isMobile={ctx.isMobile}
        onClose={ctx.closeSuccess}
      />

      {ctx.isMobile ? <AppLayoutMobile ctx={ctx} /> : <AppLayoutDesktop ctx={ctx} />}
    </>
  )
}
