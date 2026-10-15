import { useEffect, useState } from 'react'

export const PAGE_SIZE = 50

/**
 * Search box + page state for a server-paged list. The query sent to the API waits until typing pauses,
 * and any change of search (or of `filters`) goes back to page 1.
 */
export function usePagedSearch(filters: unknown[] = [], pageSize = PAGE_SIZE) {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  // The page remembers which search it belongs to; a different search starts again at page 1.
  const listKey = JSON.stringify([q, filters])
  const [current, setCurrent] = useState({ listKey, page: 1 })
  const page = current.listKey === listKey ? current.page : 1

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  return {
    search,
    setSearch,
    q,
    page,
    setPage: (next: number) => setCurrent({ listKey, page: next }),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
}
