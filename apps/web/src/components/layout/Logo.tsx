import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import logoLight from '@/assets/logo-light.png'
import { cn } from '@/lib/utils'

/** Horizontal lockup built from docs/assets/logo.pdf; `dark` uses the white-ink variant for navy backgrounds. */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn('flex h-11 shrink-0 items-center', className)}>
      <img src={dark ? logoLight : logo} alt="White Crane Training Collective" className="h-full w-auto" />
    </Link>
  )
}
