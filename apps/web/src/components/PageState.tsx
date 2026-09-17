import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageLoader({ className }: { className?: string }) {
  return (
    <div role="status" className={cn('flex items-center justify-center p-12 text-muted-foreground', className)}>
      Loading...
    </div>
  )
}

export function ErrorState({ error, className }: { error: unknown; className?: string }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <div role="alert" className={cn('rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-destructive', className)}>
      {message}
    </div>
  )
}

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-dashed p-8 text-center text-muted-foreground', className)}>{children}</div>
}

/** Renders loading / error states for a query, then the children once data exists. */
export function QueryState<T>({
  query,
  children,
}: {
  query: { data: T | undefined; isLoading: boolean; error: unknown }
  children: (data: T) => ReactNode
}) {
  if (query.isLoading) return <PageLoader />
  if (query.error) return <ErrorState error={query.error} />
  if (query.data === undefined) return null
  return <>{children(query.data)}</>
}
