import type { Training, TrainingInput } from '@/api/types'
import { formatDate, formatTimeRange } from './format'
import type { TrainingValues } from './schemas'

/**
 * When a training runs, as visitors read it. The trainer's "Dates as shown" text wins (it can spell out
 * multi-day schedules like "Nov 18, 19, & 20, 2026"), then the stored date and times.
 */
export function trainingWhen(t: Pick<Training, 'starts_at' | 'ends_at' | 'expected_label'>) {
  if (t.expected_label) return t.expected_label
  if (!t.starts_at) return 'Date to be announced'
  const lastDay = t.ends_at && t.ends_at.slice(0, 10) !== t.starts_at.slice(0, 10) ? t.ends_at : null
  if (lastDay) return `${formatDate(t.starts_at)} to ${formatDate(lastDay)}`
  const time = formatTimeRange(t.starts_at, t.ends_at)
  return time ? `${formatDate(t.starts_at)}, ${time}` : formatDate(t.starts_at)
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const emptyTrainingValues: TrainingValues = {
  title: '',
  slug: '',
  status: 'open',
  format: 'online',
  date: '',
  end_date: '',
  start_time: '09:00',
  end_time: '16:00',
  expected_label: '',
  trainers: '',
  description: '',
  objectives: '',
  agenda: '',
  registration_url: '',
  capacity: '',
  cover_image_url: null,
}

export const toTrainingValues = (t: Training): TrainingValues => ({
  title: t.title,
  slug: t.slug,
  status: t.status,
  format: t.format,
  date: t.starts_at?.slice(0, 10) ?? '',
  end_date: t.ends_at && t.ends_at.slice(0, 10) !== t.starts_at?.slice(0, 10) ? t.ends_at.slice(0, 10) : '',
  start_time: t.starts_at?.slice(11, 16) ?? '',
  end_time: t.ends_at?.slice(11, 16) ?? '',
  expected_label: t.expected_label,
  trainers: t.trainers,
  description: t.description,
  objectives: t.objectives,
  agenda: t.agenda,
  registration_url: t.registration_url ?? '',
  capacity: t.capacity?.toString() ?? '',
  cover_image_url: t.cover_image_url,
})

export const toTrainingInput = (v: TrainingValues): TrainingInput => ({
  title: v.title,
  slug: v.slug,
  status: v.status,
  format: v.format,
  starts_at: v.date ? `${v.date}T${v.start_time || '00:00'}:00` : null,
  ends_at: v.date && v.end_time ? `${v.end_date || v.date}T${v.end_time}:00` : null,
  expected_label: v.expected_label,
  trainers: v.trainers,
  description: v.description,
  objectives: v.objectives,
  agenda: v.agenda,
  registration_url: v.registration_url || null,
  capacity: v.capacity ? Number(v.capacity) : null,
  cover_image_url: v.cover_image_url,
})
