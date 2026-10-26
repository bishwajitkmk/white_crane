import { ArrowRight, Mail, Menu, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession, type SignOutState } from '@/auth/session'
import { SubscribeForm } from '@/components/forms/SubscribeForm'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/directory', label: 'Directory' },
  { to: '/resources', label: 'Resources' },
]

/** "Sign in" for visitors, "Dashboard" once signed in (staff browsing the public site). */
function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { user, isLoading } = useSession()
  return (
    <ButtonLink to={user ? '/dashboard' : '/login'} variant="secondary" onClick={onClick} className={cn(isLoading && 'invisible', className)}>
      {user ? 'Dashboard' : 'Sign in'}
    </ButtonLink>
  )
}

/** Frosted button style for the header when it sits over the dark Home hero. */
const ON_DARK = 'border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'

/** Slide-in panel holding every page link, plus sign-in and Apply. Closes on Escape, backdrop click or navigation. */
function MenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div className={cn('fixed inset-0 z-50', !open && 'pointer-events-none')} inert={!open}>
      <div
        aria-hidden
        onClick={onClose}
        className={cn('absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      <nav
        id="site-menu"
        aria-label="Main"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-linear-to-b from-navy to-teal p-6 text-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <Logo dark className="h-10" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform duration-300 hover:rotate-90 hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="mt-8 flex flex-col">
          {LINKS.map((l, i) => (
            <li
              key={l.to}
              className={cn('transition-all duration-500', open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0')}
              style={{ transitionDelay: open ? `${100 + i * 50}ms` : '0ms' }}
            >
              <NavLink
                to={l.to}
                end={l.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 border-b border-white/10 py-3 text-base font-semibold transition-colors',
                    isActive ? 'text-sky' : 'text-white hover:text-sky',
                  )
                }
              >
                <span className="w-5 text-[11px] font-semibold text-white/40">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{l.label}</span>
                <ArrowRight aria-hidden className="size-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
          <AccountLink onClick={onClose} />
          <ButtonLink to="/contact" variant="secondary" onClick={onClose} className={ON_DARK}>
            <Mail aria-hidden className="size-4" /> Contact us
          </ButtonLink>
        </div>
      </nav>
    </div>
  )
}

/**
 * Logo on the left; sign-in, Apply and the menu button on the right. On Home the header is transparent
 * and sits over the dark hero; elsewhere it is a light bar.
 */
function Nav() {
  const { pathname } = useLocation()
  const overHero = pathname === '/'
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <header className={cn(overHero ? 'absolute inset-x-0 top-0 z-30 text-white' : 'border-b bg-background')}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:py-5">
        <Logo dark={overHero} />
        <div className="flex items-center gap-3 sm:gap-5">
          <ButtonLink
            to="/directory/apply"
            variant={overHero ? 'secondary' : 'default'}
            className={cn('hidden sm:inline-flex', overHero && ON_DARK)}
          >
            Apply to Directory
          </ButtonLink>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
            className={cn('group -mr-2 flex size-10 cursor-pointer items-center justify-center transition-colors', overHero ? 'text-white hover:text-sky' : 'hover:text-primary')}
          >
            <Menu className="size-6 transition-transform duration-300 group-hover:scale-x-125" />
          </button>
        </div>
      </div>
      <MenuPanel open={open} onClose={close} />
    </header>
  )
}

/** Pages with their own sign-up section, where the footer form would sit right under a second copy. */
const OWN_SUBSCRIBE = new Set(['/resources', '/trainings/upcoming'])

function Footer() {
  const { pathname } = useLocation()
  return (
    <footer className="bg-surface text-[13px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="flex max-w-xs flex-col gap-2">
            <Logo />
            <b>White Crane Training Collective</b>
            <span className="text-muted-foreground">
              Training and community for DBT teams.{' '}
              <Link to="/contact" className="font-semibold text-primary">
                Contact us
              </Link>
            </span>
          </div>
          {!OWN_SUBSCRIBE.has(pathname.replace(/\/$/, '')) && (
            <div className="flex w-full max-w-sm flex-col gap-2">
              <b>Sign up for updates</b>
              <SubscribeForm source="Footer" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground [&>a]:py-2 lg:[&>a]:py-0">
          <span>&copy; {new Date().getFullYear()} White Crane Training Collective.</span>
          <Link to="/trainings">Trainings</Link>
          <Link to="/trainers">Trainers</Link>
          <Link to="/directory">Directory</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Staff sign in</Link>
        </div>
      </div>
    </footer>
  )
}

/** Finishes a sign-out started in the dashboard, now that no signed-in page is mounted. */
function useFinishSignOut() {
  const { signOut } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const signingOut = (location.state as SignOutState | null)?.signingOut

  useEffect(() => {
    if (!signingOut) return
    void signOut()
    navigate(location.pathname, { replace: true, state: null }) // so Back/refresh doesn't repeat it
  }, [signingOut, signOut, navigate, location.pathname])
}

export function PublicLayout() {
  useFinishSignOut()
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
