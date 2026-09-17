import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api, type RenewalWindow } from '@/api/endpoints'
import type { ApplicationStatus } from '@/api/types'

export const keys = {
  content: ['content'] as const,
  boardMembers: ['board-members'] as const,
  trainings: ['trainings'] as const,
  training: (idOrSlug: string) => ['trainings', idOrSlug] as const,
  directory: (q: string, location: string) => ['directory', q, location] as const,
  resources: ['resources'] as const,
  summary: ['summary'] as const,
  applications: ['applications'] as const,
  application: (id: string) => ['applications', id] as const,
  listings: ['listings'] as const,
  subscribers: ['subscribers'] as const,
  users: ['users'] as const,
}

// ---------- public ----------
export const useSiteContent = () => useQuery({ queryKey: [...keys.content, 'public'], queryFn: api.public.content })
export const usePublicBoardMembers = () =>
  useQuery({ queryKey: [...keys.boardMembers, 'public'], queryFn: api.public.boardMembers })
export const useOpenTrainings = () => useQuery({ queryKey: [...keys.trainings, 'open'], queryFn: api.public.trainings })
export const useUpcomingTrainings = () =>
  useQuery({ queryKey: [...keys.trainings, 'upcoming'], queryFn: api.public.upcomingTrainings })
export const usePublicTraining = (slug: string) =>
  useQuery({ queryKey: [...keys.training(slug), 'public'], queryFn: () => api.public.training(slug) })
export const useDirectory = (q: string, location: string) =>
  useQuery({ queryKey: keys.directory(q, location), queryFn: () => api.public.directory({ q, location }) })
export const usePublicResources = () => useQuery({ queryKey: [...keys.resources, 'public'], queryFn: api.public.resources })

// ---------- admin ----------
export const useSummary = () => useQuery({ queryKey: keys.summary, queryFn: api.admin.summary })
export const useAdminContent = () => useQuery({ queryKey: keys.content, queryFn: api.admin.content })
export const useBoardMembers = () => useQuery({ queryKey: keys.boardMembers, queryFn: api.admin.boardMembers })
export const useTrainings = () => useQuery({ queryKey: keys.trainings, queryFn: api.admin.trainings })
export const useTraining = (id: string | undefined) =>
  useQuery({ queryKey: keys.training(id ?? ''), queryFn: () => api.admin.training(id!), enabled: !!id })
export const useApplications = (status?: ApplicationStatus) =>
  useQuery({ queryKey: [...keys.applications, { status }], queryFn: () => api.admin.applications(status) })
export const useApplication = (id: string) =>
  useQuery({ queryKey: keys.application(id), queryFn: () => api.admin.application(id) })
export const useListings = (renewal?: RenewalWindow) =>
  useQuery({ queryKey: [...keys.listings, { renewal }], queryFn: () => api.admin.listings({ renewal }) })
export const useResources = () => useQuery({ queryKey: keys.resources, queryFn: api.admin.resources })
export const useSubscribers = () => useQuery({ queryKey: keys.subscribers, queryFn: api.admin.subscribers })
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
