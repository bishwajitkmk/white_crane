import type { ApplicationStatus, Listing, ResourceCategory, TrainingFormat, TrainingStatus } from '@/api/types'
import type { BadgeVariant } from '@/components/ui/badge'
import { daysUntil } from './format'

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warn' },
  info_requested: { label: 'Info requested', variant: 'acc' },
  approved: { label: 'Approved', variant: 'ok' },
  declined: { label: 'Declined', variant: 'bad' },
}

export const TRAINING_STATUS: Record<TrainingStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: 'Open', variant: 'ok' },
  upcoming: { label: 'Upcoming', variant: 'acc' },
}

export const TRAINING_FORMAT: Record<TrainingFormat, string> = {
  online: 'Online',
  in_person: 'In person',
}

export const RESOURCE_CATEGORY: Record<ResourceCategory, string> = {
  forms: 'Forms',
  reading: 'Reading',
  links: 'Links',
  for_teams: 'For teams',
}

/** Listings hide automatically once renewal_due_at passes; they are never deleted. */
export function listingStatus(listing: Listing): { label: string; variant: BadgeVariant } {
  const days = daysUntil(listing.renewal_due_at)
  if (days < 0) return { label: 'Hidden (expired)', variant: 'bad' }
  if (listing.hidden) return { label: 'Hidden', variant: 'bad' }
  if (days <= 30) return { label: `Due in ${days} days`, variant: 'warn' }
  return { label: 'Active', variant: 'ok' }
}
