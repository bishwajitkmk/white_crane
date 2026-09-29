import { useMutation } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { RegistrationForm } from '@/components/forms/RegistrationForm'
import { ErrorState, PageLoader } from '@/components/PageState'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicTraining } from '@/hooks/queries'
import { formatDate, formatTimeRange } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'
import { Confirmation } from '../Confirmation'

/** /trainings/:slug/register — the built-in form used when a training has no external registration URL. */
export default function TrainingRegister() {
  const { slug = '' } = useParams()
  const query = usePublicTraining(slug)
  const t = query.data
  useDocumentTitle(t ? `Register: ${t.title}` : 'Register')
  const registration = useMutation({ mutationFn: api.public.register.bind(null, slug) })

  if (registration.isSuccess) {
    return (
      <Confirmation
        title="You're registered"
        actions={
          <>
            <ButtonLink to={`/trainings/${slug}`} variant="secondary">
              Back to training
            </ButtonLink>
            <ButtonLink to="/trainings" variant="secondary">
              Browse Trainings
            </ButtonLink>
          </>
        }
      >
        Your place at {registration.data.training_title} is booked. We emailed a confirmation to{' '}
        {registration.data.email}.
      </Confirmation>
    )
  }

  if (query.isLoading) return <PageLoader />
  if (query.error || !t) return <Section><ErrorState error={query.error ?? new Error('Training not found.')} /></Section>

  const external = t.registration_url
  return (
    <Section>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
          <Link to="/trainings" className="hover:text-primary">
            Trainings
          </Link>
          &nbsp;/&nbsp;
          <Link to={`/trainings/${t.slug}`} className="hover:text-primary">
            {t.title}
          </Link>
          &nbsp;/&nbsp; Register
        </nav>
        <PageTitle>Register: {t.title}</PageTitle>
        <Lede>
          {t.starts_at ? `${formatDate(t.starts_at)}, ${formatTimeRange(t.starts_at, t.ends_at)}` : t.expected_label || 'Date to be announced'}.{' '}
          {TRAINING_FORMAT[t.format]}.
        </Lede>
        {t.accepting_registrations ? (
          <RegistrationForm onSubmit={(input) => registration.mutate(input)} pending={registration.isPending} error={registration.error} />
        ) : external ? (
          <p>
            This training takes registrations on another site.{' '}
            <a href={external} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
              Open the registration page
            </a>
            .
          </p>
        ) : (
          <div>
            <Badge variant="acc">{t.is_full ? 'Fully booked' : 'Registration closed'}</Badge>
          </div>
        )}
      </div>
    </Section>
  )
}
