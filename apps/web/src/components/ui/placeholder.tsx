import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Grey box standing in for imagery (logo, photos, hero) until real assets arrive. */
export function Placeholder({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-center rounded-md bg-placeholder text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}
