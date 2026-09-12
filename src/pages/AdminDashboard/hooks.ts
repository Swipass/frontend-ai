// src/pages/AdminDashboard/hooks.ts
// Hooks the admin pages share: who is signed in and what their role allows,
// and a loader that reports failures as a toast.
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export type StaffRole = 'super_admin' | 'staff_support' | 'staff_finance' | 'staff_moderator'

/** The signed-in admin's role, and whether it may take a given action. */
export function useAdminRole() {
  const { user, isLoaded, isSuperAdmin } = useAuth()
  const role = (user?.role || null) as StaffRole | null
  const can = useCallback(
    (...roles: StaffRole[]) => isSuperAdmin || (role !== null && roles.includes(role)),
    [isSuperAdmin, role],
  )
  return { role, isLoaded, isSuperAdmin, can }
}

/**
 * Runs `fetcher` on mount and whenever it changes, keeps the last good data
 * and reports a failure with a toast. `reload` runs it again on demand; a
 * `quiet` reload keeps the current data on screen while it refreshes.
 */
export function useLoad<T>(fetcher: () => Promise<T>, label = 'Could not load this page') {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const seq = useRef(0)

  const run = useCallback(
    async (quiet = false) => {
      const id = ++seq.current
      if (!quiet) setLoading(true)
      try {
        const result = await fetcher()
        if (id !== seq.current) return
        setData(result)
        setError(null)
      } catch (e: any) {
        if (id !== seq.current) return
        const message = e?.message || label
        setError(message)
        toast.error(message)
      } finally {
        if (id === seq.current) setLoading(false)
      }
    },
    [fetcher, label],
  )

  useEffect(() => {
    run()
  }, [run])

  return { data, setData, loading, error, reload: run }
}
