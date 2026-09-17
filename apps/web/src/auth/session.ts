import { createContext, useContext } from 'react'
import type { User } from '@/api/types'

export interface Session {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  setUser: (user: User) => void
}

export const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <SessionProvider>')
  return session
}
