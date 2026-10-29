import { Link } from 'react-router-dom'
import type { Training } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { formatDate, formatShortDay, formatTimeRange } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'

/**
 * Register button: the external registration page when the trainer set one, otherwise the built-in form.
 * Shows "Fully booked" once capacity is reached, and nothing when registration is closed.
 */
export function RegisterLink({ training, block = false, variant = 'default' }: { training: Training; block?: boolean; variant?: 'default' | 'secondary' }) {
  if (training.registration_url) {
    return (
      <a href={training.registration_url} target="_blank" rel="noreferrer" className={buttonVariants({ block, variant })}>
        Register
      </a>
    )
  }
  if (training.accepting_registrations) {
    return (
      <Link to={`/trainings/${training.slug}/register`} className={buttonVariants({ block, variant })}>
        Register
      </Link>
    )
  }
  if (training.is_full) return <Badge variant="warn" className="self-center">Fully booked</Badge>
  return null
}

/** Compact card used on Home: date tile, title, time and format, link to the detail page. */
export function TrainingCard({ training }: { training: Training }) {
  const day = training.starts_at ? formatShortDay(training.starts_at) : null
  return (
    <Card className="group lift flex-1 gap-4">
      <div className="flex items-start gap-4">
        {day && (
          <div className="w-16 shrink-0 rounded-xl bg-sky/25 py-2 text-center text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <small className="block font-label text-sm font-semibold tracking-[0.12em] uppercase">{day.month}</small>
            <b className="block text-[28px] leading-tight font-semibold">{day.day}</b>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <Badge variant="acc" className="self-start">
            {TRAINING_FORMAT[training.format]}
          </Badge>
          <CardTitle>
            <Link to={`/trainings/${training.slug}`} className="hover:text-primary">
              {training.title}
            </Link>
          </CardTitle>
        </div>
      </div>
      <CardDescription>
        {formatDate(training.starts_at)}, {formatTimeRange(training.starts_at, training.ends_at)}
        {training.trainers && <span className="block">With {training.trainers}</span>}
      </CardDescription>
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <Link to={`/trainings/${training.slug}`} className="font-semibold text-primary hover:underline">
          View details
        </Link>
        <RegisterLink training={training} variant="secondary" />
      </div>
    </Card>
  )
}

/** Wide row used on the Trainings list. */
export function TrainingRow({ training }: { training: Training }) {
  const day = training.starts_at ? formatShortDay(training.starts_at) : null
  return (
    <article className="group lift flex flex-col gap-5 rounded-2xl border bg-background p-6 shadow-soft sm:flex-row sm:items-start sm:gap-7 md:p-7">
      {day && (
        <div className="w-[92px] shrink-0 rounded-xl bg-sky/25 p-2.5 text-center text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <small className="font-label text-sm font-semibold tracking-[0.12em] uppercase transition-colors duration-300 group-hover:text-primary-foreground/80">{day.month}</small>
          <b className="block text-[32px] leading-tight font-semibold">{day.day}</b>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">{training.title}</h3>
        <p className="text-muted-foreground">
          {formatTimeRange(training.starts_at, training.ends_at)}. {training.trainers}. {TRAINING_FORMAT[training.format]}.
        </p>
        <p className="line-clamp-2 text-muted-foreground">{training.description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 text-center sm:w-[180px]">
        <RegisterLink training={training} />
        <Link to={`/trainings/${training.slug}`} className="font-semibold text-primary hover:underline">
          View details
        </Link>
      </div>
    </article>
  )
}

export function UpcomingTrainingCard({ training }: { training: Training }) {
  return (
    <Card className="lift border-t-4 border-t-sky">
      <CardTitle>{training.title}</CardTitle>
      <CardDescription>
        Expected: {training.expected_label || 'To be announced'}. {training.description}
      </CardDescription>
      <div>
        <Badge variant="acc">Registration not open</Badge>
      </div>
    </Card>
  )
}
