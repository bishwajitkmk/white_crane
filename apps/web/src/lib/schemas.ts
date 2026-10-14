import { z } from 'zod'
import { PRACTICE_ITEMS, RESIDENTIAL_ITEMS, requiredItems } from './attestation'

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`)
const email = z.email('Enter a valid email address')
const optionalUrl = z.union([z.literal(''), z.url('Enter a full URL, including https://')])
const newPassword = z.string().min(10, 'At least 10 characters')

/** Honeypot: rendered hidden (HoneypotField), so only bots fill it; the API silently drops those submissions. */
const nickname = z.string()

export const subscribeSchema = z.object({ email, nickname })
export type SubscribeValues = z.infer<typeof subscribeSchema>

export const loginSchema = z.object({ email, password: requiredText('Password') })
export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const acceptInviteSchema = z
  .object({ name: requiredText('Name'), password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>

export const profileSchema = z.object({ name: requiredText('Name'), email })
export type ProfileValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({ current: requiredText('Current password'), password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

/** Form key for an attestation item. Prefixed because react-hook-form reads numeric path segments as array indexes. */
export const answerKey = (itemId: string) => `q${itemId}`

/** Null until chosen: react-hook-form reads a radio group with nothing checked as null. */
const yesNo = z.enum(['', 'yes', 'no']).nullable()

const teamMemberSchema = z.object({
  name: requiredText('Name'),
  affiliation: requiredText('Agency / practice'),
  email,
  joined_on: requiredText('Date joined'),
})

export const applicationSchema = z
  .object({
    application_type: z.enum(['', 'new', 'renewal']).nullable(),
    agency_name: requiredText('Organization / agency / team name'),
    location: requiredText('Location'),
    website: optionalUrl,
    public_contact: requiredText('Public contact'),
    contact_name: requiredText('Team Leader name'),
    contact_email: email,
    contact_phone: z.string().trim(),
    program_address: z.string().trim(),
    services: z.array(z.string()),
    services_other: z.string().trim(),
    team_members: z.array(teamMemberSchema).min(1, 'Add at least one team member'),
    first_consultation_on: requiredText('Date of first consultation team meeting'),
    residential: yesNo,
    answers: z.record(z.string(), yesNo),
    comments_residential: z.string().trim(),
    comments_practices: z.string().trim(),
    additional_info: z.string().trim(),
    attested: z.boolean().refine((v) => v, 'You must attest before submitting'),
    attestation_signed_name: requiredText('Typed name'),
    attestation_signed_title: requiredText('Title / role'),
    nickname,
  })
  .superRefine((v, ctx) => {
    if (!v.application_type) {
      ctx.addIssue({ code: 'custom', path: ['application_type'], message: 'Choose a new listing or an annual renewal' })
    }
    if (v.services.length === 0 && !v.services_other) {
      ctx.addIssue({ code: 'custom', path: ['services'], message: 'Choose at least one service' })
    }
    if (!v.residential) {
      ctx.addIssue({ code: 'custom', path: ['residential'], message: 'Choose Yes or No' })
    }
    const residential = v.residential === 'yes'
    for (const item of requiredItems(residential)) {
      if (!v.answers[answerKey(item.id)]) {
        ctx.addIssue({ code: 'custom', path: ['answers', answerKey(item.id)], message: 'Choose Yes or No' })
      }
    }
    const anyNo = (items: { id: string }[]) => items.some((i) => v.answers[answerKey(i.id)] === 'no')
    if (residential && anyNo(RESIDENTIAL_ITEMS) && !v.comments_residential) {
      ctx.addIssue({ code: 'custom', path: ['comments_residential'], message: 'Explain each "No" answer and your plan to address it' })
    }
    if (anyNo(PRACTICE_ITEMS) && !v.comments_practices) {
      ctx.addIssue({ code: 'custom', path: ['comments_practices'], message: 'Explain each "No" answer and your plan to address it' })
    }
    // Run even when other fields are invalid, so every missing answer is flagged on the first submit.
  }, { when: () => true })
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
    capacity: z.string().trim().regex(/^([1-9][0-9]*)?$/, 'Enter a whole number, or leave empty for no limit'),
    cover_image_url: z.string().nullable(),
  })
  .refine((v) => v.status !== 'open' || v.date !== '', { path: ['date'], message: 'Open trainings need a date' })
export type TrainingValues = z.infer<typeof trainingSchema>

export const registrationSchema = z.object({
  full_name: requiredText('Full name'),
  email,
  phone: z.string().trim(),
  organization: z.string().trim(),
  role: z.string().trim(),
  notes: z.string().trim().max(2000, 'Keep this under 2000 characters'),
  nickname,
})
export type RegistrationValues = z.infer<typeof registrationSchema>

export const landingContentSchema = z.object({
  hero_headline: requiredText('Headline'),
  hero_subheading: z.string(),
  hero_cta_label: requiredText('Button label'),
  hero_image_url: z.string().nullable(),
  about_intro: z.string(),
  mission: z.string(),
  what_we_do: z.string(),
  who_we_serve: z.string(),
  how_we_work: z.string(),
  values: z.string(),
  about_closing: z.string(),
  trainer_credentials: z.string(),
})
export type LandingContentValues = z.infer<typeof landingContentSchema>

export const boardMemberSchema = z.object({
  kind: z.enum(['board', 'trainer']),
  name: requiredText('Name'),
  role: z.string().trim(),
  bio: z.string(),
  photo_url: z.string().nullable(),
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
