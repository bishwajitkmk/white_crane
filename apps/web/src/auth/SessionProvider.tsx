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

  // Update the session entry in place (so everything reading useSession re-renders at once), then drop
  // cached data no screen is showing (the dashboard's, once it has unmounted). Never queryClient.clear()
  // or remove queries a mounted page observes: the observers are orphaned and that UI stays stale (the
  // old user, or "Loading...") until a page refresh.
  const dropSession = useCallback(() => {
    setUser(null)
    queryClient.removeQueries({ type: 'inactive', predicate: (q) => q.queryKey[0] !== ME_KEY[0] })
  }, [queryClient, setUser])

  // Signed out elsewhere, deactivated, or idle past the refresh token: drop the session so RequireRole
  // sends the user to /login (and back to this page afterwards).
  useEffect(() => {
    const onExpired = () => {
      if (!queryClient.getQueryData(ME_KEY)) return
      dropSession()
      setExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [queryClient, dropSession])

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
    // Screen first, then the server (clears the cookies). A failed request (offline, API asleep) still
    // leaves the visitor signed out locally.
    dropSession()
    await api.auth.logout().catch(() => undefined)
  }, [dropSession])

  const value = useMemo<Session>(
    () => ({ user: me.data ?? null, isLoading: me.isLoading, expired, signIn, signOut, setUser }),
    [me.data, me.isLoading, expired, signIn, signOut, setUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
