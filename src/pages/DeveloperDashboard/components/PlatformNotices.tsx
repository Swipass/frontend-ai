// src/pages/DeveloperDashboard/components/PlatformNotices.tsx
// What operations has switched off or announced, as it affects this developer.
// Renders nothing when the platform is running normally.
import { Link } from 'react-router-dom'
import type { PlatformNotice } from '../../../services/platformService'
import { AlertItem, type AlertLevel } from '../shared'

type Notice = { key: string; level: AlertLevel; title: string; detail: string; to?: string; cta?: string }

function notices(p: PlatformNotice): Notice[] {
  const out: Notice[] = []
  if (p.paused) {
    out.push({
      key: 'paused',
      level: 'critical',
      title: 'Swipass is paused',
      detail: p.message || 'Intents are not being processed right now. Requests answer 503 until operations resumes the platform.',
    })
  } else if (p.api_traffic_paused) {
    out.push({
      key: 'api',
      level: 'critical',
      title: 'API traffic is paused',
      detail: 'Requests sent with an API key answer 503 until it resumes. Nothing about your projects or balance changes.',
    })
  }
  if (p.message && !p.paused) {
    out.push({ key: 'message', level: 'warning', title: 'Notice from operations', detail: p.message })
  }
  if (p.payouts_frozen) {
    out.push({
      key: 'payouts',
      level: 'info',
      title: 'Payouts are on hold',
      detail: 'Your balance is safe and keeps accruing. You can request it once payouts resume.',
      to: '/dashboard/developer/payouts',
      cta: 'Payouts',
    })
  }
  return out
}

export function PlatformNotices({ platform }: { platform?: PlatformNotice | null }) {
  if (!platform) return null
  const items = notices(platform)
  if (items.length === 0) return null
  return (
    <div className="mb-6 flex flex-col gap-3">
      {items.map(n => (
        <AlertItem
          key={n.key}
          level={n.level}
          title={n.title}
          detail={n.detail}
          action={
            n.to ? (
              <Link to={n.to} className="pill pill-dark h-9">
                {n.cta}
              </Link>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}
