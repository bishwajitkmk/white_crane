import { Link } from 'react-router-dom'
import type { Training } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { formatDate, formatShortDay, formatTimeRange } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'

/** External registration link. Hidden until the trainer sets a URL. */
export function RegisterLink({ training, block = false, variant = 'default' }: { training: Training; block?: boolean; variant?: 'default' | 'secondary' }) {
  if (!training.registration_url) return null
  return (
    <a href={training.registration_url} target="_blank" rel="noreferrer" className={buttonVariants({ block, variant })}>
      Register
    </a>
  )
}

/** Compact card used on Home. */
export function TrainingCard({ training }: { training: Training }) {
  return (
    <Card>
      <CardTitle>
        <Link to={`/trainings/${training.slug}`} className="hover:text-primary">
          {training.title}
        </Link>
      </CardTitle>
      <CardDescription>
        {formatDate(training.starts_at)}, {formatTimeRange(training.starts_at, training.ends_at)}. {TRAINING_FORMAT[training.format]}.
      </CardDescription>
      <div className="mt-auto pt-1">
        <RegisterLink training={training} variant="secondary" />
      </div>
    </Card>
  )
}

/** Wide row used on the Trainings list. */
export function TrainingRow({ training }: { training: Training }) {
  const day = training.starts_at ? formatShortDay(training.starts_at) : null
  return (
    <article className="flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-start sm:gap-6">
      {day && (
        <div className="w-[90px] shrink-0 rounded-md bg-surface p-2 text-center">
          <small className="text-xs font-semibold text-muted-foreground">{day.month}</small>
          <b className="block text-[28px] leading-tight">{day.day}</b>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="text-xl font-semibold">{training.title}</h3>
        <p className="text-muted-foreground">
          {formatTimeRange(training.starts_at, training.ends_at)}. {training.trainers}. {TRAINING_FORMAT[training.format]}.
        </p>
        <p className="line-clamp-2 text-muted-foreground">{training.description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 text-center sm:w-[180px]">
        <RegisterLink training={training} />
        <Link to={`/trainings/${training.slug}`} className="text-[13px] font-semibold text-primary">
          View details
        </Link>
      </div>
    </article>
  )
}

export function UpcomingTrainingCard({ training }: { training: Training }) {
  return (
    <Card>
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
