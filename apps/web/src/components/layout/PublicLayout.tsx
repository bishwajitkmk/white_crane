import { ArrowRight, Mail, Menu, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import autoliniumLogo from '@/assets/autolinium-logo.png'
import { useSession, type SignOutState } from '@/auth/session'
import { SubscribeForm } from '@/components/forms/SubscribeForm'
import { ButtonLink } from '@/components/ui/button'
import { ON_DARK } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { HeroBandContext } from './hero-band'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/directory', label: 'Directory' },
  { to: '/resources', label: 'Resources' },
]

/** Inline header links on wide screens; the logo already goes home, and Contact moves up from the menu. */
const BAR_LINKS = [...LINKS.slice(1), { to: '/contact', label: 'Contact' }]

/** "Sign in" for visitors, "Dashboard" once signed in (staff browsing the public site). */
function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { user, isLoading } = useSession()
  return (
    <ButtonLink to={user ? '/dashboard' : '/login'} variant="secondary" onClick={onClick} className={cn(isLoading && 'invisible', className)}>
      {user ? 'Dashboard' : 'Sign in'}
    </ButtonLink>
  )
}

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
        className={cn('absolute inset-0 bg-navy/70 transition-opacity md:bg-navy/50 md:backdrop-blur-sm duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      <nav
        id="site-menu"
        aria-label="Main"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-linear-to-b from-navy to-teal p-6 text-white transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]',
          // Shadow only while open: parked off-screen it would bleed in along the right edge of the pale hero.
          open ? 'translate-x-0 shadow-2xl' : 'translate-x-full',
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
          <ButtonLink to="/directory/apply" onClick={onClose} className="col-span-2 border-white bg-white text-ink hover:border-sky hover:bg-sky">
            Apply to Directory <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <AccountLink onClick={onClose} className={ON_DARK} />
          <ButtonLink to="/contact" variant="secondary" onClick={onClose} className={ON_DARK}>
            <Mail aria-hidden className="size-4" /> Contact us
          </ButtonLink>
        </div>
      </nav>
    </div>
  )
}

/** True once the page has scrolled past `offset` px. */
function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/**
 * Floating frosted bar pinned to the top: logo, page links (wide screens), Apply and the menu button.
 * It picks up a deeper shadow once the page scrolls under it.
 */
function Nav() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const scrolled = useScrolled()

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          'mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-full border bg-white/80 py-2 pr-2 pl-4 backdrop-blur-xl transition-shadow duration-300 sm:pl-6',
          scrolled ? 'border-border shadow-[0_12px_32px_-14px_rgb(15_42_59/0.25)]' : 'border-white/80 shadow-soft',
        )}
      >
        <Logo className="h-9 sm:h-10" />
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {BAR_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors',
                      isActive ? 'bg-sky/25 text-ink' : 'text-muted-foreground hover:bg-surface hover:text-ink',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink to="/directory/apply" className="hidden h-10 sm:inline-flex">
            Apply to Directory
          </ButtonLink>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
            className="group flex size-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface xl:hidden"
          >
            <Menu className="size-5 transition-transform duration-300 group-hover:scale-x-125" />
          </button>
        </div>
      </div>
      <MenuPanel open={open} onClose={close} />
    </header>
  )
}

/** Pages with their own sign-up section, where the footer form would sit right under a second copy. */
const OWN_SUBSCRIBE = new Set(['/resources', '/trainings/upcoming'])

const FOOTER_LINKS = [...LINKS.slice(1), { to: '/contact', label: 'Contact' }, { to: '/login', label: 'Staff sign in' }]

function Footer() {
  const { pathname } = useLocation()
  const subscribe = !OWN_SUBSCRIBE.has(pathname.replace(/\/$/, ''))
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pt-14 pb-8 sm:px-6 md:pt-20">
        <div className={cn('grid gap-10 md:grid-cols-2', subscribe && 'lg:grid-cols-[1.2fr_0.8fr_1.2fr]')}>
          <div className="flex max-w-sm flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground">
              Training and community for DBT teams, and a directory of programs practicing DBT with fidelity.
            </p>
            <Link to="/contact" className="group flex items-center gap-1.5 self-start font-semibold text-primary">
              Contact us <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-4">
            <span className="eyebrow">Explore</span>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {FOOTER_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {subscribe && (
            <div className="flex w-full flex-col gap-4 md:col-span-2 lg:col-span-1">
              <span className="eyebrow">Stay in the loop</span>
              <p className="-mt-1 text-muted-foreground">New trainings and resources, a few times a year.</p>
              <SubscribeForm source="Footer" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} White Crane Training Collective. All rights reserved.</span>
          <a
            href="https://www.autolinium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-2.5 self-start transition-colors hover:text-ink md:self-auto"
          >
            Developed by
            <img
              src={autoliniumLogo}
              alt="Autolinium"
              width={53}
              height={48}
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </a>
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
  const [hasHero, setHasHero] = useState(false)
  return (
    <HeroBandContext value={setHasHero}>
      <div className="relative flex min-h-dvh flex-col text-base">
        <Nav />
        <main className="flex-1">
          {/* Strip behind the header while the page shows no hero of its own (loading, errors). */}
          {!hasHero && <div aria-hidden className="airy h-[88px] sm:h-24" />}
          <Outlet />
        </main>
        <Footer />
      </div>
    </HeroBandContext>
  )
}
