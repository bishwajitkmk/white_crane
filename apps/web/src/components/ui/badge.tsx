import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'ok' | 'warn' | 'bad' | 'acc'

const variants: Record<BadgeVariant, string> = {
  ok: 'bg-success/15 text-success',
  warn: 'bg-warning/15 text-warning',
  bad: 'bg-destructive/15 text-destructive',
  acc: 'bg-primary/15 text-primary',
}

export function Badge({ variant = 'acc', className, ...props }: ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn('inline-block rounded-full px-2 py-[3px] text-xs font-semibold whitespace-nowrap', variants[variant], className)}
      {...props}
    />
  )
}
