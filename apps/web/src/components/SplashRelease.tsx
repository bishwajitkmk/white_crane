import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { releaseSplashWhenSettled } from '@/lib/splash'

/** Starts watching for the first page to settle, after the first commit has started its queries and lazy pages. */
export function SplashRelease() {
  const client = useQueryClient()
  useEffect(() => releaseSplashWhenSettled(client), [client])
  return null
}
