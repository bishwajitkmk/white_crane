import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, type ReactNode } from 'react'
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

  const setUser = useCallback((user: User | null) => queryClient.setQueryData(ME_KEY, user), [queryClient])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await api.auth.login(email, password)
      setUser(user)
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
    () => ({ user: me.data ?? null, isLoading: me.isLoading, signIn, signOut, setUser }),
    [me.data, me.isLoading, signIn, signOut, setUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
