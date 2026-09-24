import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { navFor, ROLE_LABEL } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useSession()
  const navigate = useNavigate()
  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col gap-1 p-5">
      <Logo dark className="w-full" />
      <div className="mt-1 mb-2 text-xs text-sidebar-muted">{ROLE_LABEL[user.role]} view</div>
      <nav aria-label="Dashboard" className="flex flex-col gap-1">
        {navFor(user.role).map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-0.5">
            <div className="mt-2.5 text-[11px] font-semibold text-sidebar-muted">{group}</div>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-2',
                    isActive ? 'bg-primary font-semibold text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex gap-2 px-2.5 pt-6 text-[13px] text-sidebar-muted">
        <NavLink to="/dashboard/account" onClick={onNavigate} className="hover:text-sidebar-foreground">
          My account
        </NavLink>
        <span aria-hidden>|</span>
        <button type="button" onClick={handleSignOut} className="cursor-pointer hover:text-sidebar-foreground">
          Sign out
        </button>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto bg-sidebar lg:block">
        <Sidebar />
      </aside>

      {/* Under 1024 the sidebar becomes a top drawer */}
      <div className="bg-sidebar text-sidebar-foreground lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo dark />
          <button type="button" aria-expanded={open} aria-controls="dashboard-nav" onClick={() => setOpen((o) => !o)} className="-mr-2 flex min-h-11 items-center gap-1.5 px-2 font-semibold">
            {open ? <X className="size-5" /> : <Menu className="size-5" />} Menu
          </button>
        </div>
        {open && (
          <div id="dashboard-nav">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

/** Topbar + padded content area for a single dashboard screen. */
export function DashboardPage({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useSession()
  useDocumentTitle(title)

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b bg-background px-4 py-4 sm:px-8">
        <h1 className="min-w-0 text-xl">{title}</h1>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link to="/" className="py-2 font-semibold whitespace-nowrap text-primary">
            <span className="hidden sm:inline">View public site</span>
            <span className="sm:hidden">Public site</span>
          </Link>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-placeholder text-xs font-semibold text-muted-foreground"
            title={user?.name}
          >
            {user?.name.charAt(0)}
          </span>
        </div>
      </header>
      <div className="flex flex-col gap-5 p-4 sm:p-8">{children}</div>
    </>
  )
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', className)}>{children}</div>
}
