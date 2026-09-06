// src/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react'
import { fetchMe, logout as doLogout, loginWith, AuthUser } from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const u = await fetchMe()
    setUser(u)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await doLogout()
    setUser(null)
    window.location.href = '/'
  }, [])

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    isAdmin: !!user?.is_admin,
    isSuperAdmin: !!user?.is_super_admin,
    login: loginWith,
    logout,
    refresh,
  }
}
