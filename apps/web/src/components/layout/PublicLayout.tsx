import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { SubscribeForm } from '@/components/forms/SubscribeForm'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/directory', label: 'Directory' },
  { to: '/resources', label: 'Resources' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('hover:text-primary', isActive ? 'font-semibold text-primary' : 'text-foreground')

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:py-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <ButtonLink to="/directory/apply" className="hidden lg:inline-flex">
          Apply to Directory
        </ButtonLink>
        <button
          type="button"
          className="flex items-center gap-1.5 font-bold lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />} Menu
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="flex flex-col gap-1 border-t px-4 py-3 sm:px-6 lg:hidden">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={(s) => cn(linkClass(s), 'py-2')} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <ButtonLink to="/directory/apply" block className="mt-2" onClick={() => setOpen(false)}>
            Apply to Directory
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-surface text-[13px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="flex max-w-xs flex-col gap-2">
            <Logo />
            <b>White Crane Training Collective</b>
            <span className="text-muted-foreground">
              Training and community for DBT teams.{' '}
              <a href="mailto:info@whitecrane.org" className="font-semibold text-primary">
                info@whitecrane.org
              </a>
            </span>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <b>Sign up for updates</b>
            <SubscribeForm source="Footer" />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} White Crane Training Collective.</span>
          <Link to="/trainings">Trainings</Link>
          <Link to="/directory">Directory</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
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
