import { createContext, useContext, useLayoutEffect } from 'react'

/**
 * The public header is white and transparent, so it needs a dark band behind it. Pages with a hero say so
 * through useHeroBand(); otherwise (loading, errors, not found) the layout puts a plain navy strip there.
 */
export const HeroBandContext = createContext<(present: boolean) => void>(() => {})

export function useHeroBand() {
  const setPresent = useContext(HeroBandContext)
  useLayoutEffect(() => {
    setPresent(true)
    return () => setPresent(false)
  }, [setPresent])
}
