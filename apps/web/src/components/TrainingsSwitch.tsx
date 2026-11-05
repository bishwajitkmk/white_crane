import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const VIEWS = [
  { to: '/trainings', label: 'Open for registration' },
  { to: '/trainings/upcoming', label: 'Upcoming' },
]

/** Two-way switch between the open and upcoming training lists, shown in both pages' hero. */
export function TrainingsSwitch({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Training lists"
      className={cn('inline-flex w-fit rounded-full border bg-background/80 p-1 shadow-soft backdrop-blur', className)}
    >
      {VIEWS.map((v) => (
        <NavLink
          key={v.to}
          to={v.to}
          end
          className={({ isActive }) =>
            cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              isActive ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {v.label}
        </NavLink>
      ))}
    </nav>
  )
}
