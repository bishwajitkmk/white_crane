import { useId, type ReactElement, type ReactNode } from 'react'
import { cloneElement } from 'react'
import type { FieldError } from 'react-hook-form'
import { Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  error?: FieldError
  hint?: ReactNode
  required?: boolean
  className?: string
  /** A single input / textarea / select. Field wires up id and aria attributes. */
  children: ReactElement<Record<string, unknown>>
}

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <span id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="text-xs text-destructive">
          {error.message}
        </span>
      )}
    </div>
  )
}

/** Two-column row of fields that stacks under 640px. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start">{children}</div>
}

export function FormError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <p role="alert" className="text-[13px] text-destructive">
      {error instanceof Error ? error.message : 'Something went wrong. Try again.'}
    </p>
  )
}
