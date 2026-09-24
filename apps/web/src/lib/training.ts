import type { Training, TrainingInput } from '@/api/types'
import type { TrainingValues } from './schemas'

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
  start_time: '09:00',
  end_time: '16:00',
  expected_label: '',
  trainers: '',
  description: '',
  objectives: '',
  agenda: '',
  registration_url: '',
  cover_image_url: null,
}

export const toTrainingValues = (t: Training): TrainingValues => ({
  title: t.title,
  slug: t.slug,
  status: t.status,
  format: t.format,
  date: t.starts_at?.slice(0, 10) ?? '',
  start_time: t.starts_at?.slice(11, 16) ?? '',
  end_time: t.ends_at?.slice(11, 16) ?? '',
  expected_label: t.expected_label,
  trainers: t.trainers,
  description: t.description,
  objectives: t.objectives,
  agenda: t.agenda,
  registration_url: t.registration_url ?? '',
  cover_image_url: t.cover_image_url,
})

export const toTrainingInput = (v: TrainingValues): TrainingInput => ({
  title: v.title,
  slug: v.slug,
  status: v.status,
  format: v.format,
  starts_at: v.date ? `${v.date}T${v.start_time || '00:00'}:00` : null,
  ends_at: v.date && v.end_time ? `${v.date}T${v.end_time}:00` : null,
  expected_label: v.expected_label,
  trainers: v.trainers,
  description: v.description,
  objectives: v.objectives,
  agenda: v.agenda,
  registration_url: v.registration_url || null,
  cover_image_url: v.cover_image_url,
})
