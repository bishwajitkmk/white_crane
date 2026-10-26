import { Globe, MapPin } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, QueryState } from '@/components/PageState'
import { Reveal } from '@/components/Reveal'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { ON_DARK } from '@/components/ui/button-variants'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDirectory } from '@/hooks/queries'

const PAGE_SIZE = 9

/** Page numbers to show: the first, the last, and two either side of the current one ("…" for gaps). */
function pageWindow(current: number, pages: number): (number | '…')[] {
  const shown = [...new Set([1, current - 2, current - 1, current, current + 1, current + 2, pages])]
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b)
  return shown.flatMap((p, i) => (i > 0 && p - shown[i - 1] > 1 ? ['…' as const, p] : [p]))
}

export default function Directory() {
  useDocumentTitle('DBT Clinical Directory')
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const location = params.get('location') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const listings = useDirectory({ q, location, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
  const [draft, setDraft] = useState({ q, location })

  const search = (e: FormEvent) => {
    e.preventDefault()
    setParams(Object.fromEntries(Object.entries(draft).filter(([, v]) => v)))
  }

  const goTo = (p: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  return (
    <>
      <PageHero
        eyebrow="For clients and referrers"
        title="DBT Clinical Directory"
        lede="Teams approved by the Directorate as meeting DBT fidelity standards."
      >
        <form role="search" onSubmit={search} className="mt-2 flex flex-col gap-3 md:flex-row">
          <Input
            aria-label="Search by agency name"
            placeholder="Search by agency name"
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            className="md:w-[400px]"
          />
          <Input
            aria-label="Location or state"
            placeholder="Location / state"
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            className="md:w-60"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          <ButtonLink to="/directory/apply" variant="secondary" className={`md:ml-auto ${ON_DARK}`}>
            Apply as a Team
          </ButtonLink>
        </form>
      </PageHero>

      <Section className="gap-4">
        <QueryState query={listings}>
          {({ items: visible, total }) => {
            const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
            const current = Math.min(page, pages)
            return (
              <>
                <span className="text-muted-foreground" aria-live="polite">
                  {total} approved {total === 1 ? 'team' : 'teams'}
                </span>
                {total === 0 ? (
                  <EmptyState>No teams match your search.</EmptyState>
                ) : visible.length === 0 ? (
                  // An old link to a page past the end, e.g. after teams were removed.
                  <EmptyState>
                    This page is past the end of the list.{' '}
                    <Button variant="link" onClick={() => goTo(pages)}>
                      Go to the last page
                    </Button>
                  </EmptyState>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visible.map((l, i) => (
                      <Reveal key={l.id} index={i % 3} className="flex">
                        <Card className="group lift flex-1 gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <span
                              aria-hidden
                              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground"
                            >
                              <MapPin className="size-5" />
                            </span>
                            <Badge variant="ok">Approved {new Date(l.published_at).getFullYear()}</Badge>
                          </div>
                          <CardTitle className="transition-colors group-hover:text-primary">{l.agency_name}</CardTitle>
                          <span className="text-muted-foreground">{l.location}</span>
                          <span className="mt-auto flex flex-wrap items-center gap-x-2 border-t pt-3 font-semibold text-primary">
                            {l.website && (
                              <a href={l.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline">
                                <Globe aria-hidden className="size-4" />
                                {l.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                            {l.website && l.public_contact && <span aria-hidden>|</span>}
                            <span>{l.public_contact}</span>
                          </span>
                        </Card>
                      </Reveal>
                    ))}
                  </div>
                )}
                {pages > 1 && (
                  <nav aria-label="Pagination" className="flex justify-center gap-2">
                    <Button variant="link" disabled={current === 1} onClick={() => goTo(current - 1)}>
                      Prev
                    </Button>
                    {pageWindow(current, pages).map((p, i) =>
                      p === '…' ? (
                        <span key={`gap-${i}`} aria-hidden className="self-center text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant="link"
                          aria-current={p === current ? 'page' : undefined}
                          className={p === current ? 'underline' : ''}
                          onClick={() => goTo(p)}
                        >
                          {p}
                        </Button>
                      ),
                    )}
                    <Button variant="link" disabled={current === pages} onClick={() => goTo(current + 1)}>
                      Next
                    </Button>
                  </nav>
                )}
              </>
            )
          }}
        </QueryState>
      </Section>
    </>
  )
}
