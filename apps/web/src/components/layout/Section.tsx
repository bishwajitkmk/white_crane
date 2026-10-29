import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Full-width public page band. Content is capped at 1200px with 24px / 16px side padding on small screens. */
export function Section({ alt = false, className, children, ...props }: ComponentProps<'section'> & { alt?: boolean }) {
  return (
    <section className={cn(alt && 'border-y border-border/60 bg-surface')} {...props}>
      <div className={cn('mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-14 sm:px-6 md:py-24', className)}>{children}</div>
    </section>
  )
}

export function PageTitle({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cn('text-[40px] md:text-[56px]', className)} {...props} />
}

export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('text-[30px] md:text-[44px]', className)} {...props} />
}

export function Lede({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('max-w-[640px] text-lg leading-relaxed text-muted-foreground', className)} {...props} />
}

/** Small uppercase label above a heading (styles in index.css). */
export function Eyebrow({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('eyebrow', className)} {...props} />
}
