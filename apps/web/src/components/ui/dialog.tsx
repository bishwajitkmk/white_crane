import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** "drawer" slides in from the right (listing / resource editors), "modal" is centered (invite). */
  variant?: 'modal' | 'drawer'
}

export function Dialog({ open, onClose, title, children, variant = 'modal' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        'bg-background p-0 text-foreground backdrop:bg-foreground/40',
        variant === 'drawer'
          ? 'fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md border-l'
          : 'm-auto w-[calc(100%-32px)] max-w-lg rounded-lg border',
      )}
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-surface">
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
