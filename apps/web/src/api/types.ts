export type Role = 'board' | 'trainer' | 'directorate'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'invited'
  last_sign_in_at: string | null
}

export interface SiteContent {
  hero_headline: string
  hero_subheading: string
  hero_cta_label: string
  hero_image_url: string | null
  mission: string
  vision: string
  values: string
}

export interface BoardMember {
  id: string
  name: string
  role: string
  bio: string
  photo_url: string | null
  position: number
}

export type TrainingStatus = 'open' | 'upcoming'
export type TrainingFormat = 'online' | 'in_person'

export interface Training {
  id: string
  slug: string
  title: string
  status: TrainingStatus
  format: TrainingFormat
  starts_at: string | null
  ends_at: string | null
  /** Free text for upcoming trainings without a date, e.g. "Spring 2027". */
  expected_label: string
  trainers: string
  description: string
  objectives: string
  agenda: string
  registration_url: string | null
  cover_image_url: string | null
}

export type TrainingInput = Omit<Training, 'id'>

export type ApplicationStatus = 'pending' | 'approved' | 'declined' | 'info_requested'

export interface ApplicationInput {
  agency_name: string
  location: string
  website: string
  public_contact: string
  contact_name: string
  contact_email: string
  contact_phone: string
  attestation_signed_name: string
}

export interface Application extends ApplicationInput {
  id: string
  status: ApplicationStatus
  attestation_signed_at: string
  attestation_version: string
  submitted_at: string
  reviewed_at: string | null
  activity: { at: string; message: string }[]
}

export type DecisionAction = 'approve' | 'decline' | 'request-info'

export interface Listing {
  id: string
  application_id: string
  agency_name: string
  location: string
  website: string
  public_contact: string
  contact_email: string
  published_at: string
  renewal_due_at: string
  hidden: boolean
}

export type ListingInput = Pick<Listing, 'agency_name' | 'location' | 'website' | 'public_contact' | 'renewal_due_at' | 'hidden'>

export type ResourceCategory = 'forms' | 'reading' | 'links' | 'for_teams'

export interface Resource {
  id: string
  title: string
  description: string
  category: ResourceCategory
  kind: 'file' | 'link'
  url: string
  file_size_bytes: number | null
  updated_at: string
}

export type ResourceInput = Pick<Resource, 'title' | 'description' | 'category' | 'kind' | 'url'>

export interface Subscriber {
  id: string
  email: string
  subscribed_at: string
  source: string
  confirmed: boolean
}

export interface DashboardSummary {
  pending_applications: number
  pending_over_7_days: number
  renewals_due_60_days: number
  upcoming_trainings_30_days: number
  subscribers: number
  subscribers_this_month: number
  recent_applications: Application[]
}
