import type { QueryClient } from '@tanstack/react-query'

/**
 * The boot splash lives inline in index.html, so it paints from the first response with no extra request.
 * It stays up while the API wakes from a cold start and fades out once the first page has settled:
 * no query fetching and no PageLoader (lazy route or query) on screen.
 */
let loaders = 0
let check = () => {}

/** PageLoader holds the splash while it is mounted. Returns the release, for a useEffect cleanup. */
export function holdSplash() {
  loaders++
  return () => {
    loaders--
    check()
  }
}

/** Called after the first render. Returns a cleanup, for a useEffect. */
export function releaseSplashWhenSettled(client: QueryClient) {
  const splash = document.getElementById('splash')
  if (!splash) return

  let settle: number | undefined
  const stop = () => {
    unsubscribe()
    clearTimeout(cap)
    clearTimeout(settle)
    check = () => {}
  }
  const close = () => {
    stop()
    splash.classList.add('splash-out')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    setTimeout(() => splash.remove(), 1000) // transitionend does not fire with reduced motion
  }
  check = () => {
    clearTimeout(settle)
    // A short settle, so a query that starts as another ends (or a lazy page that then fetches) keeps the splash up.
    settle = window.setTimeout(() => {
      if (loaders === 0 && client.isFetching() === 0) close()
    }, 150)
  }
  const unsubscribe = client.getQueryCache().subscribe(() => check())
  // Never trap the visitor: past this the page's own loading and error states take over.
  const cap = window.setTimeout(close, 90_000)
  check()
  return stop
}
