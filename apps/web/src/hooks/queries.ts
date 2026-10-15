import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { MemberKind, PageQuery } from '@/api/types'

export const keys = {
  content: ['content'] as const,
  boardMembers: ['board-members'] as const,
  trainings: ['trainings'] as const,
  training: (idOrSlug: string) => ['trainings', idOrSlug] as const,
  registrations: (trainingId: string) => ['trainings', trainingId, 'registrations'] as const,
  directory: ['directory'] as const,
  resources: ['resources'] as const,
  summary: ['summary'] as const,
  applications: ['applications'] as const,
  application: (id: string) => ['applications', id] as const,
  listings: ['listings'] as const,
  subscribers: ['subscribers'] as const,
  users: ['users'] as const,
}

type DirectoryParams = Parameters<typeof api.public.directory>[0]

// ---------- public ----------
export const useSiteContent = () => useQuery({ queryKey: [...keys.content, 'public'], queryFn: api.public.content })
export const usePublicBoardMembers = (kind: MemberKind) =>
  useQuery({ queryKey: [...keys.boardMembers, kind, 'public'], queryFn: () => api.public.boardMembers(kind) })
export const useOpenTrainings = () => useQuery({ queryKey: [...keys.trainings, 'open'], queryFn: api.public.trainings })
export const useUpcomingTrainings = () =>
  useQuery({ queryKey: [...keys.trainings, 'upcoming'], queryFn: api.public.upcomingTrainings })
export const usePublicTraining = (slug: string) =>
  useQuery({ queryKey: [...keys.training(slug), 'public'], queryFn: () => api.public.training(slug) })
export const useDirectory = (params: DirectoryParams) =>
  useQuery({
    queryKey: [...keys.directory, params],
    queryFn: () => api.public.directory(params),
    placeholderData: keepPreviousData,
  })
export const usePublicResources = () => useQuery({ queryKey: [...keys.resources, 'public'], queryFn: api.public.resources })

// ---------- admin ----------
export const useSummary = () => useQuery({ queryKey: keys.summary, queryFn: api.admin.summary })
export const useAdminContent = () => useQuery({ queryKey: keys.content, queryFn: api.admin.content })
export const useBoardMembers = (kind: MemberKind) =>
  useQuery({ queryKey: [...keys.boardMembers, kind], queryFn: () => api.admin.boardMembers(kind) })
export const useTrainings = () => useQuery({ queryKey: keys.trainings, queryFn: api.admin.trainings })
export const useTraining = (id: string | undefined) =>
  useQuery({ queryKey: keys.training(id ?? ''), queryFn: () => api.admin.training(id!), enabled: !!id })
export const useRegistrations = (trainingId: string) =>
  useQuery({ queryKey: keys.registrations(trainingId), queryFn: () => api.admin.registrations(trainingId) })
export const useApplications = (params: Parameters<typeof api.admin.applications>[0]) =>
  useQuery({
    queryKey: [...keys.applications, params],
    queryFn: () => api.admin.applications(params),
    placeholderData: keepPreviousData,
  })
export const useApplicationCounts = (q: string) =>
  useQuery({ queryKey: [...keys.applications, 'counts', q], queryFn: () => api.admin.applicationCounts(q) })
export const useApplication = (id: string) =>
  useQuery({ queryKey: keys.application(id), queryFn: () => api.admin.application(id) })
export const useListings = (params: Parameters<typeof api.admin.listings>[0] = {}) =>
  useQuery({
    queryKey: [...keys.listings, params],
    queryFn: () => api.admin.listings(params),
    placeholderData: keepPreviousData,
  })
export const useListingStats = () =>
  useQuery({ queryKey: [...keys.listings, 'stats'], queryFn: api.admin.listingStats })
export const useListing = (id: string | null) =>
  useQuery({ queryKey: [...keys.listings, 'one', id], queryFn: () => api.admin.listing(id!), enabled: !!id })
export const useResources = () => useQuery({ queryKey: keys.resources, queryFn: api.admin.resources })
export const useSubscribers = (params: { q?: string } & PageQuery) =>
  useQuery({
    queryKey: [...keys.subscribers, params],
    queryFn: () => api.admin.subscribers(params),
    placeholderData: keepPreviousData,
  })
export const useUsers = () => useQuery({ queryKey: keys.users, queryFn: api.admin.users })

/** Mutation that invalidates the given query keys (plus the dashboard summary) on success. */
export function useInvalidatingMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>, invalidate: QueryKey[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([...invalidate, keys.summary].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  })
}
