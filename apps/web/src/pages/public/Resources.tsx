import { ExternalLink, FileText } from 'lucide-react'
import { useState } from 'react'
import type { ResourceCategory } from '@/api/types'
import { EmptyState, QueryState } from '@/components/PageState'
import { SubscribeForm } from '@/components/forms/SubscribeForm'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { buttonVariants } from '@/components/ui/button-variants'
import { Tabs } from '@/components/ui/tabs'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicResources } from '@/hooks/queries'
import { formatBytes } from '@/lib/format'
import { RESOURCE_CATEGORY } from '@/lib/status'

type Filter = ResourceCategory | 'all'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...Object.entries(RESOURCE_CATEGORY).map(([value, label]) => ({ value: value as ResourceCategory, label })),
]

export default function Resources() {
  useDocumentTitle('Resources')
  const resources = usePublicResources()
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <>
      <Section className="gap-4">
        <PageTitle>Resources</PageTitle>
        <Lede>Links, information and forms curated by White Crane.</Lede>
        <Tabs value={filter} onChange={setFilter} options={FILTERS} />
      </Section>
      <Section className="gap-4 pt-0 md:pt-0">
        <QueryState query={resources}>
          {(list) => {
            const visible = list.filter((r) => filter === 'all' || r.category === filter)
            if (visible.length === 0) return <EmptyState>No resources in this category yet.</EmptyState>
            return visible.map((r) => {
              const Icon = r.kind === 'file' ? FileText : ExternalLink
              return (
                <article key={r.id} className="flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:gap-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-placeholder text-muted-foreground">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <h2 className="text-base font-semibold">{r.title}</h2>
                    <span className="text-[13px] text-muted-foreground">
                      {r.description} {RESOURCE_CATEGORY[r.category]}.{' '}
                      {r.kind === 'file' ? `PDF, ${formatBytes(r.file_size_bytes)}` : 'External link'}
                    </span>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    download={r.kind === 'file' ? '' : undefined}
                    className={buttonVariants({ variant: 'secondary' })}
                  >
                    {r.kind === 'file' ? 'Download' : 'Open link'}
                  </a>
                </article>
              )
            })
          }}
        </QueryState>
      </Section>
      <Section alt className="gap-3">
        <h2 className="text-xl font-semibold">Stay in the loop</h2>
        <SubscribeForm source="Resources page" />
      </Section>
    </>
  )
}
