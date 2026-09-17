import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, QueryState } from '@/components/PageState'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDirectory } from '@/hooks/queries'

const PAGE_SIZE = 9

export default function Directory() {
  useDocumentTitle('DBT Clinical Directory')
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const location = params.get('location') ?? ''
  const page = Number(params.get('page') ?? 1)
  const listings = useDirectory(q, location)
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
      <Section alt className="gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-2">
            <PageTitle>DBT Clinical Directory</PageTitle>
            <Lede>Teams approved by the Directorate as meeting DBT fidelity standards.</Lede>
          </div>
          <ButtonLink to="/directory/apply" variant="secondary">
            Apply as a Team
          </ButtonLink>
        </div>
        <form role="search" onSubmit={search} className="flex flex-col gap-3 md:flex-row">
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
          <Button type="submit">Search</Button>
        </form>
      </Section>

      <Section className="gap-4">
        <QueryState query={listings}>
          {(list) => {
            const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
            const current = Math.min(Math.max(page, 1), pages)
            const visible = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
            return (
              <>
                <span className="text-muted-foreground" aria-live="polite">
                  {list.length} approved {list.length === 1 ? 'team' : 'teams'}
                </span>
                {list.length === 0 ? (
                  <EmptyState>No teams match your search.</EmptyState>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visible.map((l) => (
                      <Card key={l.id}>
                        <CardTitle>{l.agency_name}</CardTitle>
                        <span className="text-muted-foreground">{l.location}</span>
                        <span className="flex flex-wrap gap-x-2 font-semibold text-primary">
                          {l.website && (
                            <a href={l.website} target="_blank" rel="noreferrer">
                              {l.website.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                          {l.website && l.public_contact && <span aria-hidden>|</span>}
                          <span>{l.public_contact}</span>
                        </span>
                        <div>
                          <Badge variant="ok">Approved {new Date(l.published_at).getFullYear()}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {pages > 1 && (
                  <nav aria-label="Pagination" className="flex justify-center gap-2">
                    <Button variant="link" disabled={current === 1} onClick={() => goTo(current - 1)}>
                      Prev
                    </Button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <Button key={p} variant="link" aria-current={p === current ? 'page' : undefined} className={p === current ? 'underline' : ''} onClick={() => goTo(p)}>
                        {p}
                      </Button>
                    ))}
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
