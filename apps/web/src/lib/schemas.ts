import { z } from 'zod'

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`)
const email = z.email('Enter a valid email address')
const optionalUrl = z.union([z.literal(''), z.url('Enter a full URL, including https://')])
const newPassword = z.string().min(10, 'At least 10 characters')

export const subscribeSchema = z.object({ email })
export type SubscribeValues = z.infer<typeof subscribeSchema>

export const loginSchema = z.object({ email, password: requiredText('Password') })
export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const acceptInviteSchema = z.object({ name: requiredText('Name'), password: newPassword })
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>

export const profileSchema = z.object({ name: requiredText('Name'), email })
export type ProfileValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({ current: requiredText('Current password'), password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export const applicationSchema = z.object({
  agency_name: requiredText('Agency / team name'),
  location: requiredText('Location'),
  website: optionalUrl,
  public_contact: requiredText('Public contact'),
  contact_name: requiredText('Name'),
  contact_email: email,
  contact_phone: z.string().trim(),
  attested: z.boolean().refine((v) => v, 'You must attest before submitting'),
  attestation_signed_name: requiredText('Typed signature'),
})
export type ApplicationValues = z.infer<typeof applicationSchema>

export const decisionSchema = z.object({ note: z.string() })
export type DecisionValues = z.infer<typeof decisionSchema>

export const trainingSchema = z
  .object({
    title: requiredText('Title'),
    slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes only'),
    status: z.enum(['open', 'upcoming']),
    format: z.enum(['online', 'in_person']),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    expected_label: z.string().trim(),
    trainers: z.string().trim(),
    description: z.string(),
    objectives: z.string(),
    agenda: z.string(),
    registration_url: optionalUrl,
  })
  .refine((v) => v.status !== 'open' || v.date !== '', { path: ['date'], message: 'Open trainings need a date' })
export type TrainingValues = z.infer<typeof trainingSchema>

export const landingContentSchema = z.object({
  hero_headline: requiredText('Headline'),
  hero_subheading: z.string(),
  hero_cta_label: requiredText('Button label'),
  mission: z.string(),
  vision: z.string(),
  values: z.string(),
})
export type LandingContentValues = z.infer<typeof landingContentSchema>

export const boardMemberSchema = z.object({
  name: requiredText('Name'),
  role: z.string().trim(),
  bio: z.string(),
})
export type BoardMemberValues = z.infer<typeof boardMemberSchema>

export const resourceSchema = z
  .object({
    title: requiredText('Title'),
    description: z.string(),
    category: z.enum(['forms', 'reading', 'links', 'for_teams']),
    kind: z.enum(['file', 'link']),
    url: z.string().trim(),
  })
  .refine((v) => v.url !== '', { path: ['url'], message: 'Upload a file or paste a URL' })
export type ResourceValues = z.infer<typeof resourceSchema>

export const inviteSchema = z.object({
  name: requiredText('Name'),
  email,
  role: z.enum(['board', 'trainer', 'directorate']),
})
export type InviteValues = z.infer<typeof inviteSchema>

export const listingSchema = z.object({
  agency_name: requiredText('Agency'),
  location: requiredText('Location'),
  website: optionalUrl,
  public_contact: z.string().trim(),
  renewal_due_at: requiredText('Renewal date'),
})
export type ListingValues = z.infer<typeof listingSchema>
