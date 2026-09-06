// src/hooks/useFeeRates.ts
// The fee rates actually in force, read from /v1/stats.
//
// These are admin-editable at runtime, so any figure written into the UI as a
// literal is wrong the moment they are changed. Every surface that quotes a rate
// reads it from here instead.
import { useEffect, useState } from 'react'
import { intentService } from '../services/intentService'

// The last rates the API reported, kept so a brief outage does not blank the
// pricing on a returning visitor's page. It is a copy of what the backend said,
// refreshed on every load, never a stand-in for asking.
const CACHE_KEY = 'swipass.fees.v1'

export interface FeeRates {
  /** Charged on traffic with no API key, for example "0.10%". */
  direct: string
  /** Charged on traffic from a developer project, for example "0.15%". */
  developer: string
  /** Share of the developer fee paid out, for example "50%". */
  revenueShare: string
  /** The developer's cut of a transaction, derived from the two above. */
  developerCut: string
  loaded: boolean
}

function percentValue(text: string | undefined): number | null {
  if (!text) return null
  const value = parseFloat(text.replace("%", ""))
  return Number.isFinite(value) ? value : null
}

const EMPTY: FeeRates = {
  direct: "",
  developer: "",
  revenueShare: "",
  developerCut: "",
  loaded: false,
}

function readCache(): FeeRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && parsed.direct ? { ...parsed, loaded: true } : null
  } catch {
    return null
  }
}

export function useFeeRates(): FeeRates {
  const [rates, setRates] = useState<FeeRates>(() => readCache() || EMPTY)

  useEffect(() => {
    let cancelled = false
    intentService
      .getStats()
      .then(stats => {
        if (cancelled) return
        const developer = stats.fee_rate_developer || ""
        const share = stats.revenue_share || ""
        const fee = percentValue(developer)
        const pct = percentValue(share)
        const next: FeeRates = {
          direct: stats.fee_rate_direct || "",
          developer,
          revenueShare: share,
          developerCut:
            fee !== null && pct !== null ? `${((fee * pct) / 100).toFixed(3)}%` : "",
          loaded: true,
        }
        setRates(next)
        try {
          if (next.direct) localStorage.setItem(CACHE_KEY, JSON.stringify(next))
        } catch {
          // A browser that refuses storage just refetches every load.
        }
      })
      .catch(() => {
        // No number is invented. Either the cached rates stand or the surface
        // says the rates are unavailable, because a wrong fee is worse than a
        // missing one.
        if (!cancelled) setRates(r => ({ ...r, loaded: true }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return rates
}
