import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

/** Segmented filter, drawn as a row of buttons like the wireframes. */
export function Tabs<T extends string>({ value, onChange, options, className }: TabsProps<T>) {
  return (
    <div role="tablist" className={cn('flex flex-wrap gap-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={buttonVariants({ variant: o.value === value ? 'default' : 'secondary', size: 'sm' })}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
