import { useState } from 'react'
import type { BoardMember } from '@/api/types'
import { Card, CardTitle } from '@/components/ui/card'
import { paragraphs } from '@/lib/format'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Board member or trainer: photo, name, role and bio, showing the first paragraph until expanded. */
export function PersonCard({ person }: { person: BoardMember }) {
  const [open, setOpen] = useState(false)
  const bio = paragraphs(person.bio)
  const shown = open ? bio : bio.slice(0, 1)

  return (
    <Card id={person.name.toLowerCase().replace(/[^a-z]+/g, '-')} className="group lift scroll-mt-6 gap-4 p-6">
      <div className="flex items-center gap-4">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={person.name}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="size-24 shrink-0 rounded-full bg-primary/10 object-cover ring-4 ring-primary/0 transition-all duration-300 group-hover:ring-primary/20"
          />
        ) : (
          <div aria-hidden className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary ring-4 ring-primary/0 transition-all duration-300 group-hover:ring-primary/20">
            {initials(person.name)}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{person.name}</CardTitle>
          {person.role && <span className="text-[13px] font-semibold text-primary">{person.role}</span>}
        </div>
      </div>
      {bio.length > 0 ? (
        <div className="flex flex-col gap-3 text-muted-foreground">
          {shown.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {bio.length > 1 && (
            <button type="button" className="self-start font-semibold text-primary hover:underline" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? 'Show less' : 'Read full bio'}
            </button>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground">Bio coming soon.</p>
      )}
    </Card>
  )
}
