// src/site/hooks.ts
// Small hooks shared by the public site: visibility, motion preference, and
// the live platform data the landing page shows.
import { useEffect, useState, type RefObject } from 'react'
import { config } from '../config'
import { intentService, type ChainInfo, type ProviderInfo, type SystemStats } from '../services/intentService'

/** True once (or while, with `once: false`) the element is on screen. */
export function useInView<T extends Element>(
  ref: RefObject<T>,
  { once = true, rootMargin = '0px 0px -10% 0px' }: { once?: boolean; rootMargin?: string } = {},
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, once, rootMargin])

  return inView
}

export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Grows the custom cursor over anything clickable. Delegated, so links and
 * buttons rendered after mount (carousels, loaded data) are covered too.
 */
export function useCursorHover(): void {
  useEffect(() => {
    const onOver = (event: MouseEvent) => {
      const interactive = (event.target as Element | null)?.closest?.('a,button,[role="button"],[role="tab"]')
      document.body.classList.toggle('cursor-hover', Boolean(interactive))
    }
    document.addEventListener('mouseover', onOver)
    return () => {
      document.removeEventListener('mouseover', onOver)
      document.body.classList.remove('cursor-hover')
    }
  }, [])
}

export type ApiHealth = 'checking' | 'up' | 'down'

/** Whether the Swipass API answers its liveness check right now. */
export function useApiHealth(): ApiHealth {
  const [health, setHealth] = useState<ApiHealth>('checking')

  useEffect(() => {
    let cancelled = false
    fetch(`${config.apiUrl}/health`)
      .then((response) => !cancelled && setHealth(response.ok ? 'up' : 'down'))
      .catch(() => !cancelled && setHealth('down'))
    return () => {
      cancelled = true
    }
  }, [])

  return health
}

export interface LandingData {
  stats: SystemStats | null
  providers: ProviderInfo[]
  chains: ChainInfo[]
}

/** Live numbers for the landing page. Each piece stays empty if the API is down. */
export function useLandingData(): LandingData {
  const [data, setData] = useState<LandingData>({ stats: null, providers: [], chains: [] })

  useEffect(() => {
    let cancelled = false
    const merge = (patch: Partial<LandingData>) => !cancelled && setData((prev) => ({ ...prev, ...patch }))
    intentService.getStats().then((stats) => merge({ stats })).catch(() => {})
    intentService.getProviders().then((providers) => merge({ providers })).catch(() => {})
    intentService.getChains().then((chains) => merge({ chains })).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return data
}
