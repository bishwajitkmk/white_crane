import { QueryState } from '@/components/PageState'
import { PersonCard } from '@/components/PersonCard'
import { RichText } from '@/components/RichText'
import { PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicBoardMembers, useSiteContent } from '@/hooks/queries'

export default function Trainers() {
  useDocumentTitle('Trainers')
  const content = useSiteContent()
  const trainers = usePublicBoardMembers('trainer')

  return (
    <>
      <Section className="gap-5">
        <PageTitle>Our Trainers</PageTitle>
        <SectionTitle>Credentialing Standards for DBT Trainers</SectionTitle>
        <QueryState query={content}>{(c) => <RichText text={c.trainer_credentials} />}</QueryState>
      </Section>

      <Section alt>
        <SectionTitle>Meet the Trainers</SectionTitle>
        <QueryState query={trainers}>
          {(list) => (
            <div className="grid items-start gap-6 md:grid-cols-2">
              {list.map((t) => (
                <PersonCard key={t.id} person={t} />
              ))}
            </div>
          )}
        </QueryState>
      </Section>
    </>
  )
}
