import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('text-base font-semibold', className)} {...props} />
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted-foreground', className)} {...props} />
}
