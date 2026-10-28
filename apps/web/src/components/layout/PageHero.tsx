import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useHeroBand } from './hero-band'
import { PageTitle } from './Section'

/** Concentric rings and waves, the same motif as the Home hero. */
export function Rings({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 480 340" preserveAspectRatio="xMidYMid slice" className={cn('absolute inset-0 h-full w-full', className)}>
      <g fill="none" stroke="var(--teal)" strokeOpacity="0.22" className="pulse-ring">
        <circle cx="430" cy="40" r="60" />
        <circle cx="430" cy="40" r="110" />
        <circle cx="430" cy="40" r="160" />
        <circle cx="430" cy="40" r="210" />
      </g>
      <g fill="none" stroke="var(--sky)" strokeOpacity="0.5" strokeWidth="1.5" className="drift">
        <path d="M0 290 C 90 250, 170 330, 260 285 S 420 240, 480 270" />
        <path d="M0 315 C 100 275, 180 355, 270 310 S 420 265, 480 295" />
      </g>
    </svg>
  )
}

/** Breadcrumb trail for the hero: links first, the current page last. */
export function HeroBreadcrumb({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground [&_a]:transition-colors [&_a:hover]:text-foreground">
      {children}
    </nav>
  )
}

/**
 * Pale sky band that opens every public page. The transparent site header sits on top of it, so the
 * top padding leaves room for the header. `children` (actions, filters, search) go under the lede.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  top,
  center = false,
  className,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  /** Above the eyebrow, e.g. a breadcrumb or an icon. */
  top?: ReactNode
  center?: boolean
  className?: string
  children?: ReactNode
}) {
  useHeroBand()
  return (
    <section className="airy relative overflow-hidden">
      <Rings />
      <div
        className={cn(
          'stagger relative mx-auto flex max-w-[1200px] flex-col gap-4 px-4 pt-28 pb-12 sm:px-6 md:pt-36 md:pb-16',
          center && 'items-center text-center',
          className,
        )}
      >
        {top}
        {eyebrow && <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">{eyebrow}</span>}
        <PageTitle className="max-w-[820px] md:text-[44px]">{title}</PageTitle>
        {lede && <p className="max-w-[640px] text-base text-muted-foreground md:text-lg">{lede}</p>}
        {children}
      </div>
    </section>
  )
}
