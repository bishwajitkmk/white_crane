/**
 * In-memory stand-in for the FastAPI backend, enabled with VITE_USE_MOCKS=true.
 * Data mirrors the wireframes so every screen renders without the API running.
 * Mock sign-in: any password; role comes from a seeded user, or from the email
 * ("trainer" -> trainer, "directorate"/"review" -> directorate, otherwise board).
 */
import { ApiError } from './client'
import type { Api, BoardMemberInput, InviteInfo, RenewalWindow } from './endpoints'
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  BoardMember,
  DecisionAction,
  Listing,
  ListingInput,
  Resource,
  ResourceInput,
  Role,
  SiteContent,
  Subscriber,
  Training,
  TrainingInput,
  User,
} from './types'

const delay = <T>(value: T, ms = 150) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
const notFound = () => Promise.reject(new ApiError(404, 'Not found'))
const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()
const SESSION_KEY = 'wc-mock-user'

let content: SiteContent = {
  hero_headline: 'Advancing DBT fidelity through training and community',
  hero_subheading:
    'White Crane Training Collective offers high-quality Dialectical Behavior Therapy training and maintains a directory of teams practicing DBT with fidelity.',
  hero_cta_label: 'Browse Trainings',
  hero_image_url: null,
  mission: 'Mission text. Editable from Landing content in the dashboard.',
  vision: 'Vision text. Editable from Landing content in the dashboard.',
  values: 'Values text. Editable from Landing content in the dashboard.',
}

let boardMembers: BoardMember[] = [
  { id: 'bm1', name: 'Ronda Oswalt Reitz', role: 'Founder, LCSW', bio: 'Short bio, two to three lines.', photo_url: null, position: 0 },
  { id: 'bm2', name: 'Member Name', role: 'Role / credentials', bio: 'Short bio, two to three lines.', photo_url: null, position: 1 },
  { id: 'bm3', name: 'Member Name', role: 'Role / credentials', bio: 'Short bio, two to three lines.', photo_url: null, position: 2 },
  { id: 'bm4', name: 'Member Name', role: 'Role / credentials', bio: 'Short bio, two to three lines.', photo_url: null, position: 3 },
]

const lorem = 'Rich text block managed from the dashboard training editor.'
let trainings: Training[] = [
  {
    id: 't1', slug: 'dbt-skills-intensive', title: 'DBT Skills Intensive', status: 'open', format: 'online',
    starts_at: '2026-10-14T09:00:00', ends_at: '2026-10-14T16:00:00', expected_label: '', trainers: 'J. Doe',
    description: lorem, objectives: lorem, agenda: lorem, registration_url: 'https://ceu-manager.example/event/1001', cover_image_url: null,
  },
  {
    id: 't2', slug: 'chain-analysis-workshop', title: 'Chain Analysis Workshop', status: 'open', format: 'in_person',
    starts_at: '2026-11-02T09:00:00', ends_at: '2026-11-02T16:00:00', expected_label: '', trainers: 'A. Smith',
    description: lorem, objectives: lorem, agenda: lorem, registration_url: 'https://ceu-manager.example/event/1002', cover_image_url: null,
  },
  {
    id: 't3', slug: 'dbt-team-consultation', title: 'DBT Team Consultation Basics', status: 'open', format: 'online',
    starts_at: '2026-11-18T09:00:00', ends_at: '2026-11-18T13:00:00', expected_label: '', trainers: 'J. Doe, A. Smith',
    description: lorem, objectives: lorem, agenda: lorem, registration_url: 'https://ceu-manager.example/event/1003', cover_image_url: null,
  },
  {
    id: 't4', slug: 'adolescent-dbt-overview', title: 'Adolescent DBT Overview', status: 'upcoming', format: 'online',
    starts_at: null, ends_at: null, expected_label: 'Spring 2027', trainers: 'TBD',
    description: 'Short description.', objectives: '', agenda: '', registration_url: null, cover_image_url: null,
  },
  {
    id: 't5', slug: 'dbt-for-substance-use', title: 'DBT for Substance Use', status: 'upcoming', format: 'in_person',
    starts_at: null, ends_at: null, expected_label: 'Summer 2027', trainers: 'TBD',
    description: 'Short description.', objectives: '', agenda: '', registration_url: null, cover_image_url: null,
  },
]

const baseApplication = (overrides: Partial<Application> & Pick<Application, 'id' | 'agency_name' | 'location'>): Application => ({
  website: 'https://example.org',
  public_contact: 'intake@example.org',
  contact_name: 'Dana Lee',
  contact_email: 'dana@example.org',
  contact_phone: '(503) 555 0100',
  attestation_signed_name: 'Dana Lee',
  attestation_signed_at: '2026-09-12T10:42:00',
  attestation_version: '1.0',
  status: 'pending',
  submitted_at: '2026-09-12T10:42:00',
  reviewed_at: null,
  activity: [],
  ...overrides,
})

let applications: Application[] = [
  baseApplication({
    id: 'a1', agency_name: 'Riverbend DBT Team', location: 'Portland, OR', website: 'https://riverbend.org',
    public_contact: 'intake@riverbend.org', contact_email: 'dana@riverbend.org', submitted_at: '2026-09-12T10:42:00',
    activity: [
      { at: '2026-09-12T10:42:00', message: 'Submitted by applicant' },
      { at: '2026-09-12T10:43:00', message: 'Confirmation email sent' },
    ],
  }),
  baseApplication({ id: 'a2', agency_name: 'Harbor Health', location: 'Seattle, WA', contact_name: 'Sam Ortiz', contact_email: 'admin@harbor.org', submitted_at: '2026-09-08T14:10:00' }),
  baseApplication({ id: 'a3', agency_name: 'Cedar Counseling', location: 'Boise, ID', contact_name: 'Lee Park', contact_email: 'info@cedar.org', submitted_at: '2026-09-01T09:05:00' }),
  baseApplication({ id: 'a4', agency_name: 'Northside Clinic', location: 'Denver, CO', status: 'info_requested', submitted_at: '2026-09-10T11:30:00' }),
  baseApplication({ id: 'a5', agency_name: 'Lakeside Behavioral', location: 'Madison, WI', status: 'approved', submitted_at: '2026-02-20T11:30:00', reviewed_at: '2026-03-02T09:00:00' }),
]

let listings: Listing[] = [
  { id: 'l1', application_id: 'a0', agency_name: 'Riverbend DBT Team', location: 'Portland, OR', website: 'https://riverbend.org', public_contact: 'intake@riverbend.org', contact_email: 'dana@riverbend.org', published_at: '2025-09-14T00:00:00', renewal_due_at: daysFromNow(28), hidden: false },
  { id: 'l2', application_id: 'a5', agency_name: 'Lakeside Behavioral', location: 'Madison, WI', website: 'https://lakeside.org', public_contact: 'hello@lakeside.org', contact_email: 'ops@lakeside.org', published_at: '2026-03-02T00:00:00', renewal_due_at: '2027-03-02T00:00:00', hidden: false },
  { id: 'l3', application_id: 'a6', agency_name: 'Summit DBT', location: 'Salt Lake City, UT', website: 'https://summitdbt.org', public_contact: '(801) 555 0199', contact_email: 'team@summitdbt.org', published_at: '2026-01-20T00:00:00', renewal_due_at: '2027-01-20T00:00:00', hidden: false },
  { id: 'l4', application_id: 'a7', agency_name: 'Cedar Counseling', location: 'Boise, ID', website: 'https://cedar.org', public_contact: 'info@cedar.org', contact_email: 'info@cedar.org', published_at: '2025-10-12T00:00:00', renewal_due_at: daysFromNow(26), hidden: false },
  { id: 'l5', application_id: 'a8', agency_name: 'Harbor Health', location: 'Seattle, WA', website: 'https://harbor.org', public_contact: 'admin@harbor.org', contact_email: 'admin@harbor.org', published_at: '2025-11-03T00:00:00', renewal_due_at: daysFromNow(55), hidden: false },
  { id: 'l6', application_id: 'a9', agency_name: 'Old Town Clinic', location: 'Austin, TX', website: 'https://oldtown.org', public_contact: 'front@oldtown.org', contact_email: 'front@oldtown.org', published_at: '2025-06-01T00:00:00', renewal_due_at: '2026-06-01T00:00:00', hidden: false },
]

let resources: Resource[] = [
  { id: 'r1', title: 'Team application checklist', description: 'Everything your team needs before applying to the directory.', category: 'forms', kind: 'file', url: '#', file_size_bytes: 240_000, updated_at: '2026-09-03T00:00:00' },
  { id: 'r2', title: 'DBT fidelity overview', description: 'What fidelity means and how teams are assessed.', category: 'reading', kind: 'link', url: 'https://example.org/fidelity', file_size_bytes: null, updated_at: '2026-08-01T00:00:00' },
  { id: 'r3', title: 'Renewal form', description: 'Annual renewal for listed teams.', category: 'forms', kind: 'file', url: '#', file_size_bytes: 120_000, updated_at: '2026-07-15T00:00:00' },
  { id: 'r4', title: 'Consultation team guide', description: 'Running an effective weekly consultation team.', category: 'for_teams', kind: 'link', url: 'https://example.org/consult', file_size_bytes: null, updated_at: '2026-06-20T00:00:00' },
]

let subscribers: Subscriber[] = [
  { id: 's1', email: 'a.person@gmail.com', subscribed_at: '2026-09-12T00:00:00', source: 'Home page', confirmed: true },
  { id: 's2', email: 'b.person@agency.org', subscribed_at: '2026-09-11T00:00:00', source: 'Resources page', confirmed: true },
  { id: 's3', email: 'c.person@clinic.org', subscribed_at: '2026-09-10T00:00:00', source: 'Upcoming trainings', confirmed: false },
]

let users: User[] = [
  { id: 'u1', name: 'Ronda Oswalt Reitz', email: 'ronda@whitecrane.org', role: 'board', status: 'active', last_sign_in_at: now() },
  { id: 'u2', name: 'Trainer One', email: 't1@whitecrane.org', role: 'trainer', status: 'active', last_sign_in_at: daysFromNow(-3) },
  { id: 'u3', name: 'Reviewer One', email: 'r1@agency.org', role: 'directorate', status: 'invited', last_sign_in_at: null },
]

const sessionUser = (): User | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const roleFromEmail = (email: string): Role =>
  /trainer/i.test(email) ? 'trainer' : /directorate|review/i.test(email) ? 'directorate' : 'board'

const trainingFromInput = (id: string, input: TrainingInput): Training => ({ ...input, id, cover_image_url: null })

const listingState = (l: Listing) => l.hidden || new Date(l.renewal_due_at) < new Date()

export const mockApi: Api = {
  public: {
    content: () => delay(content),
    boardMembers: () => delay([...boardMembers].sort((a, b) => a.position - b.position)),
    trainings: () => delay(trainings.filter((t) => t.status === 'open')),
    upcomingTrainings: () => delay(trainings.filter((t) => t.status === 'upcoming')),
    training: (slug) => {
      const t = trainings.find((x) => x.slug === slug)
      return t ? delay(t) : notFound()
    },
    directory: ({ q, location } = {}) =>
      delay(
        listings.filter(
          (l) =>
            !listingState(l) &&
            (!q || l.agency_name.toLowerCase().includes(q.toLowerCase())) &&
            (!location || l.location.toLowerCase().includes(location.toLowerCase())),
        ),
      ),
    apply: (input: ApplicationInput) => {
      const a: Application = {
        ...input,
        id: uid(),
        status: 'pending',
        attestation_signed_at: now(),
        attestation_version: '1.0',
        submitted_at: now(),
        reviewed_at: null,
        activity: [{ at: now(), message: 'Submitted by applicant' }],
      }
      applications = [a, ...applications]
      return delay(a)
    },
    resources: () => delay(resources),
    subscribe: (email, source) => {
      if (!subscribers.some((s) => s.email === email)) {
        subscribers = [{ id: uid(), email, source, subscribed_at: now(), confirmed: false }, ...subscribers]
      }
      return delay(undefined)
    },
  },

  auth: {
    login: (email) => {
      const user = users.find((u) => u.email === email) ?? {
        id: uid(), name: email.split('@')[0], email, role: roleFromEmail(email), status: 'active' as const, last_sign_in_at: now(),
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      return delay(user)
    },
    me: () => {
      const user = sessionUser()
      return user ? delay(user, 0) : Promise.reject(new ApiError(401, 'Not signed in'))
    },
    logout: () => {
      sessionStorage.removeItem(SESSION_KEY)
      return delay(undefined, 0)
    },
    forgot: () => delay(undefined),
    reset: () => delay(undefined),
    invite: () => delay<InviteInfo>({ email: 'invited@agency.org', role: 'directorate', invited_by: 'Ronda' }),
    acceptInvite: (_token, name) => {
      const user: User = { id: uid(), name, email: 'invited@agency.org', role: 'directorate', status: 'active', last_sign_in_at: now() }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      return delay(user)
    },
  },

  admin: {
    summary: () => {
      const pending = applications.filter((a) => a.status === 'pending')
      return delay({
        pending_applications: pending.length,
        pending_over_7_days: pending.filter((a) => Date.now() - new Date(a.submitted_at).getTime() > 7 * 86_400_000).length,
        renewals_due_60_days: listings.filter((l) => {
          const d = new Date(l.renewal_due_at).getTime() - Date.now()
          return d >= 0 && d <= 60 * 86_400_000
        }).length,
        upcoming_trainings_30_days: trainings.filter(
          (t) => t.starts_at && new Date(t.starts_at).getTime() - Date.now() <= 30 * 86_400_000 && new Date(t.starts_at) > new Date(),
        ).length,
        subscribers: 312,
        subscribers_this_month: 18,
        recent_applications: applications.slice(0, 3),
      })
    },

    content: () => delay(content),
    updateContent: (input) => {
      content = { ...content, ...input }
      return delay(content)
    },

    boardMembers: () => delay([...boardMembers].sort((a, b) => a.position - b.position)),
    createBoardMember: (input: BoardMemberInput) => {
      const m: BoardMember = { ...input, id: uid(), photo_url: null, position: boardMembers.length }
      boardMembers = [...boardMembers, m]
      return delay(m)
    },
    updateBoardMember: (id, input) => {
      boardMembers = boardMembers.map((m) => (m.id === id ? { ...m, ...input } : m))
      return delay(boardMembers.find((m) => m.id === id)!)
    },
    deleteBoardMember: (id) => {
      boardMembers = boardMembers.filter((m) => m.id !== id)
      return delay(undefined)
    },
    reorderBoardMembers: (ids) => {
      boardMembers = boardMembers.map((m) => ({ ...m, position: ids.indexOf(m.id) }))
      return delay(undefined)
    },

    trainings: () => delay(trainings),
    training: (id) => {
      const t = trainings.find((x) => x.id === id)
      return t ? delay(t) : notFound()
    },
    createTraining: (input) => {
      const t = trainingFromInput(uid(), input)
      trainings = [t, ...trainings]
      return delay(t)
    },
    updateTraining: (id, input) => {
      trainings = trainings.map((t) => (t.id === id ? trainingFromInput(id, input) : t))
      return delay(trainings.find((t) => t.id === id)!)
    },
    deleteTraining: (id) => {
      trainings = trainings.filter((t) => t.id !== id)
      return delay(undefined)
    },

    applications: (status?: ApplicationStatus) => delay(status ? applications.filter((a) => a.status === status) : applications),
    application: (id) => {
      const a = applications.find((x) => x.id === id)
      return a ? delay(a) : notFound()
    },
    decide: (id, action: DecisionAction, note) => {
      const status: ApplicationStatus = action === 'approve' ? 'approved' : action === 'decline' ? 'declined' : 'info_requested'
      const label = { approve: 'Approved and listing published', decline: 'Declined', 'request-info': 'More information requested' }[action]
      applications = applications.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              reviewed_at: now(),
              activity: [...a.activity, { at: now(), message: note ? `${label}. Note: ${note}` : label }],
            }
          : a,
      )
      const a = applications.find((x) => x.id === id)!
      if (action === 'approve') {
        listings = [
          {
            id: uid(), application_id: a.id, agency_name: a.agency_name, location: a.location, website: a.website,
            public_contact: a.public_contact, contact_email: a.contact_email, published_at: now(), renewal_due_at: daysFromNow(365), hidden: false,
          },
          ...listings,
        ]
      }
      return delay(a)
    },

    listings: ({ renewal }: { renewal?: RenewalWindow } = {}) => {
      const days = (l: Listing) => (new Date(l.renewal_due_at).getTime() - Date.now()) / 86_400_000
      const match = (l: Listing) =>
        renewal === 'overdue' ? days(l) < 0 : renewal === 'next_30' ? days(l) >= 0 && days(l) <= 30 : renewal === 'next_90' ? days(l) >= 0 && days(l) <= 90 : true
      return delay(listings.filter(match).sort((a, b) => a.renewal_due_at.localeCompare(b.renewal_due_at)))
    },
    updateListing: (id, input: Partial<ListingInput>) => {
      listings = listings.map((l) => (l.id === id ? { ...l, ...input } : l))
      return delay(listings.find((l) => l.id === id)!)
    },
    renewListing: (id) => {
      listings = listings.map((l) => (l.id === id ? { ...l, renewal_due_at: daysFromNow(365), hidden: false } : l))
      return delay(listings.find((l) => l.id === id)!)
    },

    resources: () => delay(resources),
    createResource: (input: ResourceInput) => {
      const r: Resource = { ...input, id: uid(), file_size_bytes: null, updated_at: now() }
      resources = [r, ...resources]
      return delay(r)
    },
    updateResource: (id, input) => {
      resources = resources.map((r) => (r.id === id ? { ...r, ...input, updated_at: now() } : r))
      return delay(resources.find((r) => r.id === id)!)
    },
    deleteResource: (id) => {
      resources = resources.filter((r) => r.id !== id)
      return delay(undefined)
    },
    presignUpload: (filename) => delay({ upload_url: '', public_url: `https://files.example/${encodeURIComponent(filename)}` }),

    subscribers: () => delay(subscribers),
    deleteSubscriber: (id) => {
      subscribers = subscribers.filter((s) => s.id !== id)
      return delay(undefined)
    },
    subscribersExportUrl: () =>
      `data:text/csv;charset=utf-8,${encodeURIComponent(
        ['email,subscribed_at,source,confirmed', ...subscribers.map((s) => `${s.email},${s.subscribed_at},${s.source},${s.confirmed}`)].join('\n'),
      )}`,

    users: () => delay(users),
    inviteUser: (input) => {
      const u: User = { ...input, id: uid(), status: 'invited', last_sign_in_at: null }
      users = [...users, u]
      return delay(u)
    },
    resendInvite: () => delay(undefined),
    updateUser: (id, input) => {
      users = users.map((u) => (u.id === id ? { ...u, ...input } : u))
      return delay(users.find((u) => u.id === id)!)
    },

    updateProfile: (input) => {
      const user = { ...sessionUser()!, ...input }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      return delay(user)
    },
    changePassword: () => delay(undefined),
  },
}
