import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Full-width public page band. Content is capped at 1200px with 24px / 16px side padding on small screens. */
export function Section({ alt = false, className, children, ...props }: ComponentProps<'section'> & { alt?: boolean }) {
  return (
    <section className={cn(alt && 'bg-surface')} {...props}>
      <div className={cn('mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:py-14', className)}>{children}</div>
    </section>
  )
}

export function PageTitle({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cn('text-[28px] leading-tight md:text-4xl', className)} {...props} />
}

export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('text-[22px] md:text-[28px]', className)} {...props} />
}

export function Lede({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('max-w-[640px] text-base text-muted-foreground', className)} {...props} />
}
