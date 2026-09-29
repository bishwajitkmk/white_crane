import { ChevronDown, ExternalLink, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { User } from '@/api/types'
import { navFor, ROLE_LABEL } from '@/auth/roles'
import { useSession, type SignOutState } from '@/auth/session'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

function Avatar({ user, className }: { user: User; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground', className)}
    >
      {initials(user.name)}
    </span>
  )
}

/**
 * Sign out behind a confirmation. Returns `ask` (open the dialog) and the dialog element to render.
 * Confirming ends the session and lands on the public home page, as a visitor.
 */
function useSignOutConfirm() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  // Only navigate here; PublicLayout ends the session once the home page is on screen. Ending it while
  // the dashboard is still mounted makes RequireRole redirect to /login instead.
  const confirm = () => {
    setPending(true)
    navigate('/', { replace: true, state: { signingOut: true } satisfies SignOutState })
  }

  const dialog = (
    <Dialog open={open} onClose={() => !pending && setOpen(false)} title="Sign out?">
      <p className="text-muted-foreground">You'll need to sign in again to use the dashboard.</p>
      <div className="flex gap-2">
        <Button onClick={confirm} disabled={pending}>
          {pending ? 'Signing out...' : 'Sign out'}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </Dialog>
  )
  return { ask: () => setOpen(true), dialog }
}

/** Pinned to the bottom of the sidebar: who is signed in, plus account and sign-out actions. */
function SidebarAccount({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const signOut = useSignOutConfirm()
  const row = 'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sidebar-foreground hover:bg-sidebar-accent'

  return (
    <div className="flex flex-col gap-1 border-t border-sidebar-accent p-3">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <Avatar user={user} />
        <div className="min-w-0">
          <div className="truncate font-semibold text-sidebar-foreground">{user.name}</div>
          <div className="truncate text-xs text-sidebar-muted">{ROLE_LABEL[user.role]}</div>
        </div>
      </div>
      <NavLink
        to="/dashboard/account"
        onClick={onNavigate}
        className={({ isActive }) => cn(row, isActive && 'bg-primary font-semibold text-primary-foreground hover:bg-primary')}
      >
        <UserRound className="size-4" /> My account
      </NavLink>
      <button type="button" onClick={signOut.ask} className={cn(row, 'cursor-pointer text-left')}>
        <LogOut className="size-4" /> Sign out
      </button>
      {signOut.dialog}
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useSession()
  if (!user) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-5">
        <Logo dark className="w-full max-lg:hidden" />
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
      </div>
      <SidebarAccount user={user} onNavigate={onNavigate} />
    </div>
  )
}

/** Top-right avatar button that opens the account menu (closes on outside click, Escape, or choosing an item). */
function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const signOut = useSignOutConfirm()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-surface'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-surface"
      >
        <Avatar user={user} className="size-8 text-xs" />
        <span className="hidden max-w-40 truncate font-semibold md:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border bg-background shadow-lg">
          <div className="border-b px-4 py-3">
            <div className="truncate font-semibold">{user.name}</div>
            <div className="truncate text-[13px] text-muted-foreground">{user.email}</div>
            <div className="mt-1 text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</div>
          </div>
          <div className="flex flex-col py-1">
            <Link role="menuitem" to="/dashboard/account" onClick={() => setOpen(false)} className={item}>
              <UserRound className="size-4 text-muted-foreground" /> My account
            </Link>
            <Link role="menuitem" to="/" onClick={() => setOpen(false)} className={item}>
              <ExternalLink className="size-4 text-muted-foreground" /> View public site
            </Link>
          </div>
          <div className="border-t py-1">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false)
                signOut.ask()
              }}
              className={cn(item, 'w-full cursor-pointer text-destructive')}
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
      {signOut.dialog}
    </div>
  )
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh bg-sidebar lg:block">
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
          {user && <AccountMenu user={user} />}
        </div>
      </header>
      <div className="flex flex-col gap-5 p-4 sm:p-8">{children}</div>
    </>
  )
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', className)}>{children}</div>
}
