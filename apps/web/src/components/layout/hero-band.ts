import { createContext, useContext, useLayoutEffect } from 'react'

/**
 * The public header is transparent, so it needs the pale hero band behind it. Pages with a hero say so
 * through useHeroBand(); otherwise (loading, errors, not found) the layout puts a plain strip of the same wash there.
 */
export const HeroBandContext = createContext<(present: boolean) => void>(() => {})

export function useHeroBand() {
  const setPresent = useContext(HeroBandContext)
  useLayoutEffect(() => {
    setPresent(true)
    return () => setPresent(false)
  }, [setPresent])
}
