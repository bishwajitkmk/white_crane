import { Link } from 'react-router-dom'
import { QueryState } from '@/components/PageState'
import { TrainingCard } from '@/components/TrainingCard'
import { Lede, PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { ButtonLink } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Placeholder } from '@/components/ui/placeholder'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useOpenTrainings, useSiteContent } from '@/hooks/queries'

export default function Home() {
  useDocumentTitle('')
  const content = useSiteContent()
  const trainings = useOpenTrainings()

  return (
    <>
      <QueryState query={content}>
        {(c) => (
          <>
            <Section alt className="md:py-20">
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_480px] lg:gap-12">
                <div className="flex flex-col gap-4">
                  <PageTitle>{c.hero_headline}</PageTitle>
                  <Lede>{c.hero_subheading}</Lede>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <ButtonLink to="/trainings">{c.hero_cta_label}</ButtonLink>
                    <ButtonLink to="/directory" variant="secondary">
                      Find a DBT Team
                    </ButtonLink>
                  </div>
                </div>
                {c.hero_image_url ? (
                  <img src={c.hero_image_url} alt="" className="h-[180px] w-full rounded-md object-cover lg:h-[300px]" />
                ) : (
                  <Placeholder className="h-[180px] lg:h-[300px]">Hero image / photo</Placeholder>
                )}
              </div>
            </Section>

            <Section>
              <SectionTitle>Mission, Vision, Values</SectionTitle>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  ['Mission', c.mission],
                  ['Vision', c.vision],
                  ['Values', c.values],
                ].map(([title, text]) => (
                  <Card key={title}>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{text}</CardDescription>
                  </Card>
                ))}
              </div>
            </Section>
          </>
        )}
      </QueryState>

      <Section alt>
        <div className="flex items-center justify-between gap-4">
          <SectionTitle>Upcoming Trainings</SectionTitle>
          <Link to="/trainings" className="hidden font-semibold text-primary sm:inline">
            View all trainings
          </Link>
        </div>
        <QueryState query={trainings}>
          {(list) => (
            <div className="grid gap-6 md:grid-cols-3">
              {list.slice(0, 3).map((t) => (
                <TrainingCard key={t.id} training={t} />
              ))}
            </div>
          )}
        </QueryState>
        <Link to="/trainings" className="font-semibold text-primary sm:hidden">
          View all trainings
        </Link>
      </Section>

      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="flex flex-col gap-3">
            <SectionTitle>DBT Clinical Directory</SectionTitle>
            <Lede>Find an approved DBT team near you, or apply to have your team listed.</Lede>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/directory">Search Directory</ButtonLink>
              <ButtonLink to="/directory/apply" variant="secondary">
                Apply as a Team
              </ButtonLink>
            </div>
          </div>
          <Placeholder className="hidden h-[200px] lg:flex">Map / illustration</Placeholder>
        </div>
      </Section>
    </>
  )
}
