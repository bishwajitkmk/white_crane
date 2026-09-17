import { EmptyState, QueryState } from '@/components/PageState'
import { UpcomingTrainingCard } from '@/components/TrainingCard'
import { SubscribeForm } from '@/components/forms/SubscribeForm'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUpcomingTrainings } from '@/hooks/queries'

export default function UpcomingTrainings() {
  useDocumentTitle('Upcoming Trainings')
  const trainings = useUpcomingTrainings()

  return (
    <>
      <Section className="gap-4">
        <PageTitle>Upcoming Trainings</PageTitle>
        <Lede>Planned trainings not yet open for registration. Sign up for updates to be notified.</Lede>
        <QueryState query={trainings}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState>No planned trainings right now.</EmptyState>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {list.map((t) => (
                  <UpcomingTrainingCard key={t.id} training={t} />
                ))}
              </div>
            )
          }
        </QueryState>
      </Section>
      <Section alt className="gap-3">
        <h2 className="text-xl font-semibold">Get notified</h2>
        <SubscribeForm source="Upcoming trainings" />
      </Section>
    </>
  )
}
