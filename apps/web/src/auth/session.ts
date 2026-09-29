import { createContext, useContext } from 'react'
import type { User } from '@/api/types'

export interface Session {
  user: User | null
  isLoading: boolean
  /** True after the session ran out mid-use (cleared on the next sign-in); Login shows a notice. */
  expired: boolean
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  setUser: (user: User) => void
}

/** Router state the dashboard sends to the home page on sign-out; PublicLayout ends the session. */
export interface SignOutState {
  signingOut?: boolean
}

export const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <SessionProvider>')
  return session
}
