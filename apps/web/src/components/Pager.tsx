import { Button } from '@/components/ui/button'

interface PagerProps {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  /** Dims the controls while the next page loads. */
  loading?: boolean
}

/** "51–100 of 1,240" with Previous / Next, under a server-paged list. Hidden when everything fits on one page. */
export function Pager({ page, pageSize, total, onPage, loading = false }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <span aria-live="polite">
        {first.toLocaleString()}–{last.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages || loading} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  )
}
