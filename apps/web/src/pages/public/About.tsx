import { QueryState } from '@/components/PageState'
import { Lede, PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { Card, CardTitle } from '@/components/ui/card'
import { Placeholder } from '@/components/ui/placeholder'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicBoardMembers, useSiteContent } from '@/hooks/queries'
import { paragraphs } from '@/lib/format'

export default function About() {
  useDocumentTitle('About')
  const content = useSiteContent()
  const members = usePublicBoardMembers()

  return (
    <>
      <Section className="gap-4">
        <PageTitle>About White Crane</PageTitle>
        <QueryState query={content}>
          {(c) => (
            <div className="flex flex-col gap-6">
              {[
                ['Mission', c.mission],
                ['Vision', c.vision],
                ['Values', c.values],
              ].map(([title, text]) => (
                <div key={title} className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {paragraphs(text).map((p, i) => (
                    <Lede key={i}>{p}</Lede>
                  ))}
                </div>
              ))}
            </div>
          )}
        </QueryState>
      </Section>

      <Section alt>
        <SectionTitle>Board of Directors</SectionTitle>
        <QueryState query={members}>
          {(list) => (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((m) => (
                <Card key={m.id}>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="h-40 w-full rounded-md object-cover" />
                  ) : (
                    <Placeholder className="h-40">Photo</Placeholder>
                  )}
                  <CardTitle>{m.name}</CardTitle>
                  <span className="text-[13px] text-muted-foreground">{m.role}</span>
                  <span className="text-[13px] text-muted-foreground">{m.bio}</span>
                </Card>
              ))}
            </div>
          )}
        </QueryState>
      </Section>
    </>
  )
}
