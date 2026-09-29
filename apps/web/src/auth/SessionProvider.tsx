import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SESSION_EXPIRED_EVENT } from '@/api/client'
import { api } from '@/api/endpoints'
import type { User } from '@/api/types'
import { SessionContext, type Session } from './session'

const ME_KEY = ['auth', 'me'] as const

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.auth.me().catch(() => null),
    staleTime: Infinity,
    retry: false,
  })

  const [expired, setExpired] = useState(false)

  const setUser = useCallback((user: User | null) => queryClient.setQueryData(ME_KEY, user), [queryClient])

  // Signed out elsewhere, deactivated, or idle past the refresh token: drop the session so RequireRole
  // sends the user to /login (and back to this page afterwards).
  useEffect(() => {
    const onExpired = () => {
      if (!queryClient.getQueryData(ME_KEY)) return
      queryClient.clear()
      setUser(null)
      setExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [queryClient, setUser])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await api.auth.login(email, password)
      setUser(user)
      setExpired(false)
      return user
    },
    [setUser],
  )

  const signOut = useCallback(async () => {
    await api.auth.logout()
    queryClient.clear()
    setUser(null)
  }, [queryClient, setUser])

  const value = useMemo<Session>(
    () => ({ user: me.data ?? null, isLoading: me.isLoading, expired, signIn, signOut, setUser }),
    [me.data, me.isLoading, expired, signIn, signOut, setUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
