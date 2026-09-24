import { absoluteUrl, del, get, patch, post, USE_MOCKS } from './client'
import { mockApi } from './mock'
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  BoardMember,
  DashboardSummary,
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

export type RenewalWindow = 'next_30' | 'next_90' | 'overdue'
export type BoardMemberInput = Pick<BoardMember, 'name' | 'role' | 'bio' | 'photo_url'>

export interface InviteInfo {
  email: string
  role: Role
  invited_by: string
}

const httpApi = {
  public: {
    content: () => get<SiteContent>('/public/content'),
    boardMembers: () => get<BoardMember[]>('/public/board-members'),
    trainings: () => get<Training[]>('/public/trainings'),
    upcomingTrainings: () => get<Training[]>('/public/trainings/upcoming'),
    training: (slug: string) => get<Training>(`/public/trainings/${slug}`),
    directory: (params: { q?: string; location?: string }) => get<Listing[]>('/public/directory', params),
    apply: (input: ApplicationInput) =>
      post<Pick<Application, 'id' | 'contact_email' | 'submitted_at'>>('/public/applications', input),
    resources: () => get<Resource[]>('/public/resources'),
    subscribe: (email: string, source: string) => post<void>('/public/subscribe', { email, source }),
  },

  auth: {
    login: (email: string, password: string) => post<User>('/auth/login', { email, password }),
    me: () => get<User>('/auth/me'),
    logout: () => post<void>('/auth/logout'),
    forgot: (email: string) => post<void>('/auth/forgot', { email }),
    reset: (token: string, password: string) => post<void>('/auth/reset', { token, password }),
    invite: (token: string) => get<InviteInfo>(`/auth/invite/${token}`),
    acceptInvite: (token: string, name: string, password: string) =>
      post<User>('/auth/accept-invite', { token, name, password }),
  },

  admin: {
    summary: () => get<DashboardSummary>('/admin/summary'),

    content: () => get<SiteContent>('/admin/content'),
    updateContent: (input: Partial<SiteContent>) => patch<SiteContent>('/admin/content', input),

    boardMembers: () => get<BoardMember[]>('/admin/board-members'),
    createBoardMember: (input: BoardMemberInput) => post<BoardMember>('/admin/board-members', input),
    updateBoardMember: (id: string, input: BoardMemberInput) => patch<BoardMember>(`/admin/board-members/${id}`, input),
    deleteBoardMember: (id: string) => del(`/admin/board-members/${id}`),
    reorderBoardMembers: (ids: string[]) => post<void>('/admin/board-members/reorder', { ids }),

    trainings: () => get<Training[]>('/admin/trainings'),
    training: (id: string) => get<Training>(`/admin/trainings/${id}`),
    createTraining: (input: TrainingInput) => post<Training>('/admin/trainings', input),
    updateTraining: (id: string, input: TrainingInput) => patch<Training>(`/admin/trainings/${id}`, input),
    deleteTraining: (id: string) => del(`/admin/trainings/${id}`),

    applications: (status?: ApplicationStatus) => get<Application[]>('/admin/applications', { status }),
    application: (id: string) => get<Application>(`/admin/applications/${id}`),
    decide: (id: string, action: DecisionAction, note: string) =>
      post<Application>(`/admin/applications/${id}/${action}`, { note }),

    listings: (params: { renewal?: RenewalWindow } = {}) => get<Listing[]>('/admin/listings', params),
    updateListing: (id: string, input: Partial<ListingInput>) => patch<Listing>(`/admin/listings/${id}`, input),
    renewListing: (id: string) => post<Listing>(`/admin/listings/${id}/renew`),

    resources: () => get<Resource[]>('/admin/resources'),
    createResource: (input: ResourceInput) => post<Resource>('/admin/resources', input),
    updateResource: (id: string, input: ResourceInput) => patch<Resource>(`/admin/resources/${id}`, input),
    deleteResource: (id: string) => del(`/admin/resources/${id}`),
    /** Presigned R2 upload; PUT the file to upload_url then save public_url on the resource. */
    presignUpload: (filename: string, content_type: string) =>
      post<{ upload_url: string; public_url: string }>('/admin/uploads/presign', { filename, content_type }),

    subscribers: () => get<Subscriber[]>('/admin/subscribers'),
    deleteSubscriber: (id: string) => del(`/admin/subscribers/${id}`),
    subscribersExportUrl: () => absoluteUrl('/admin/subscribers/export.csv'),

    users: () => get<User[]>('/admin/users'),
    inviteUser: (input: { name: string; email: string; role: Role }) => post<User>('/admin/users/invite', input),
    resendInvite: (id: string) => post<void>(`/admin/users/${id}/resend-invite`),
    updateUser: (id: string, input: { name?: string; role?: Role }) => patch<User>(`/admin/users/${id}`, input),

    updateProfile: (input: { name: string; email: string }) => patch<User>('/admin/account', input),
    changePassword: (current: string, password: string) =>
      post<void>('/admin/account/password', { current, password }),
  },
}

export type Api = typeof httpApi

export const api: Api = USE_MOCKS ? mockApi : httpApi
