import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-md border bg-background px-3 py-2.5 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-invalid:border-destructive disabled:bg-surface disabled:text-muted-foreground'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, 'h-10', className)} {...props} />
}

export function Textarea({ className, rows = 3, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(base, 'min-h-20 resize-y', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(base, 'h-10', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-[13px] font-semibold', className)} {...props} />
}
