import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** Placeholder until the client logo (SVG) arrives. */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        'flex h-8 w-[140px] items-center justify-center rounded-md text-xs font-semibold',
        dark ? 'bg-sidebar-accent text-sidebar-foreground' : 'bg-placeholder text-muted-foreground',
        className,
      )}
    >
      White Crane
    </Link>
  )
}
