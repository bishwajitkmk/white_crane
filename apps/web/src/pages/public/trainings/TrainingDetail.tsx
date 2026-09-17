import { Link, useParams } from 'react-router-dom'
import { ErrorState, PageLoader } from '@/components/PageState'
import { RegisterLink } from '@/components/TrainingCard'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicTraining } from '@/hooks/queries'
import { formatDate, formatTimeRange, paragraphs } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'

export default function TrainingDetail() {
  const { slug = '' } = useParams()
  const query = usePublicTraining(slug)
  const t = query.data
  useDocumentTitle(t?.title ?? 'Training')

  if (query.isLoading) return <PageLoader />
  if (query.error || !t) return <Section><ErrorState error={query.error ?? new Error('Training not found.')} /></Section>

  const when = t.starts_at
    ? `${formatDate(t.starts_at)}, ${formatTimeRange(t.starts_at, t.ends_at)}`
    : `Expected: ${t.expected_label || 'To be announced'}`

  return (
    <Section>
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
        <Link to="/trainings" className="hover:text-primary">
          Trainings
        </Link>
        &nbsp;/&nbsp; {t.title}
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="flex flex-col gap-5">
          <PageTitle>{t.title}</PageTitle>
          <Lede>
            {when}. {TRAINING_FORMAT[t.format]}. {t.trainers}.
          </Lede>
          {t.cover_image_url && <img src={t.cover_image_url} alt="" className="h-60 w-full rounded-md object-cover" />}
          {[
            ['Description', t.description],
            ['Objectives', t.objectives],
            ['Agenda', t.agenda],
            ['Trainers', t.trainers],
          ]
            .filter(([, text]) => text)
            .map(([heading, text]) => (
              <div key={heading} className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold">{heading}</h2>
                {paragraphs(text).map((p, i) => (
                  <p key={i} className="text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            ))}
        </div>
        <Card className="gap-3 border-0 bg-surface p-6 lg:sticky lg:top-6">
          <CardTitle>Registration</CardTitle>
          <CardDescription>
            {when}. {TRAINING_FORMAT[t.format]}.
          </CardDescription>
          {t.registration_url ? (
            <>
              <RegisterLink training={t} block />
              <span className="text-xs text-muted-foreground">Opens the CEU manager event page in a new tab.</span>
            </>
          ) : (
            <div>
              <Badge variant="acc">Registration not open</Badge>
            </div>
          )}
        </Card>
      </div>
    </Section>
  )
}
