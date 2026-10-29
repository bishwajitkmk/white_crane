import { ArrowRight, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { BoardMember } from '@/api/types'
import { Card, CardTitle } from '@/components/ui/card'
import { paragraphs } from '@/lib/format'
import { cn } from '@/lib/utils'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Longer than this (or more than one paragraph) and the four-line preview is cut, so the card offers the full bio. */
const PREVIEW_CHARS = 240

function Avatar({ person, className }: { person: BoardMember; className?: string }) {
  return person.photo_url ? (
    <img
      src={person.photo_url}
      alt={person.name}
      width={112}
      height={112}
      loading="lazy"
      decoding="async"
      className={cn('shrink-0 rounded-full bg-sky/25 object-cover', className)}
    />
  ) : (
    <div aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-full bg-sky/25 font-semibold text-primary', className)}>
      {initials(person.name)}
    </div>
  )
}

/** The full bio in a centred pop-up: photo, name and role on a soft mesh header, then the bio, scrolling if long. */
function BioDialog({ person, bio, open, onClose }: { person: BoardMember; bio: string[]; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      // showModal focuses the close button (and rings it); start on the bio instead.
      el.querySelector<HTMLElement>('[data-bio]')?.focus()
    }
    if (!open && el.open) el.close()
    if (!open) return
    // The page behind stays still while the bio is open.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="bio-dialog m-auto max-h-[min(88dvh,760px)] w-[calc(100%-32px)] max-w-2xl overflow-hidden rounded-3xl border border-white bg-background p-0 text-foreground shadow-lifted backdrop:bg-ink/45 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <header className="mesh relative flex shrink-0 flex-col items-center gap-4 overflow-hidden border-b px-6 pt-10 pb-7 text-center sm:flex-row sm:px-8 sm:text-left">
            <Avatar person={person} className="relative size-24 text-2xl ring-4 ring-white shadow-soft sm:size-28" />
            <div className="relative flex flex-col items-center gap-2 sm:items-start">
              {person.role && <span className="eyebrow">{person.role}</span>}
              <h3 id={titleId} className="text-[26px] md:text-[30px]">
                {person.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full border bg-white/80 text-ink shadow-soft transition-transform duration-300 hover:rotate-90"
            >
              <X className="size-4" />
            </button>
          </header>
          {/* Focused on open, so arrow keys scroll the bio straight away. */}
          <div data-bio tabIndex={-1} className="flex flex-col gap-4 overflow-y-auto px-6 pt-7 text-[17px] leading-relaxed text-muted-foreground outline-none sm:px-8">
            {bio.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-foreground' : undefined}>
                {p}
              </p>
            ))}
            {/* Fades the last lines while there is more to scroll. */}
            <div aria-hidden className="sticky bottom-0 -mx-8 -mt-4 h-10 shrink-0 bg-linear-to-b from-transparent to-background" />
          </div>
        </div>
      )}
    </dialog>
  )
}

/**
 * Board member or trainer: photo, name, role and a four-line bio preview. Every card keeps the same shape
 * whatever the bio's length; "Read full bio" opens the whole bio in a pop-up.
 */
export function PersonCard({ person }: { person: BoardMember }) {
  const [open, setOpen] = useState(false)
  const bio = paragraphs(person.bio)
  const long = bio.length > 1 || (bio[0]?.length ?? 0) > PREVIEW_CHARS

  return (
    <Card id={person.name.toLowerCase().replace(/[^a-z]+/g, '-')} className="group lift h-full scroll-mt-28 gap-5 p-6 md:p-7">
      <div className="flex items-center gap-4">
        <Avatar person={person} className="size-20 text-xl ring-4 ring-primary/0 transition-all duration-300 group-hover:ring-sky/40" />
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">{person.name}</CardTitle>
          {person.role && <span className="text-sm font-semibold text-accent">{person.role}</span>}
        </div>
      </div>
      {/* Always four lines tall, so short bios don't make a shorter card. */}
      <p className="line-clamp-4 min-h-[calc(4*1.625em)] leading-relaxed text-muted-foreground">
        {bio.length > 0 ? bio.join(' ') : 'Bio coming soon.'}
      </p>
      <div className="mt-auto flex h-6 items-center">
        {long && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group/bio flex cursor-pointer items-center gap-1.5 font-semibold text-primary"
          >
            Read full bio <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/bio:translate-x-1" />
          </button>
        )}
      </div>
      {long && <BioDialog person={person} bio={bio} open={open} onClose={() => setOpen(false)} />}
    </Card>
  )
}
