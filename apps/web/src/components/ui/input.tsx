import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-lg border bg-background px-3.5 py-2.5 text-base text-foreground shadow-[0_1px_2px_rgb(15_42_59/0.04)] transition-colors sm:text-[15px] placeholder:text-muted-foreground/80 hover:border-ink/20 focus-visible:border-primary focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-sky/50 aria-invalid:border-destructive disabled:bg-surface disabled:text-muted-foreground'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, 'h-11', className)} {...props} />
}

/** Password field with a show/hide toggle. Takes the same props as Input (Field wires id and aria). */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <Icon className="size-4" />
      </button>
    </div>
  )
}

export function Textarea({ className, rows = 3, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(base, 'min-h-20 resize-y', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(base, 'h-11', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-sm font-semibold', className)} {...props} />
}
