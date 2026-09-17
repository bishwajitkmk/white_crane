import type { Role } from '@/api/types'

export const ROLE_LABEL: Record<Role, string> = {
  board: 'Board',
  trainer: 'Trainer',
  directorate: 'Directorate',
}

export interface NavItem {
  label: string
  to: string
  roles: Role[]
}

const BOARD: Role[] = ['board']
const TRAININGS: Role[] = ['board', 'trainer']
const DIRECTORY: Role[] = ['board', 'directorate']

/** Sidebar groups. Items a role cannot access are hidden; empty groups are dropped. */
export const DASHBOARD_NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', roles: BOARD }] },
  {
    group: 'Content',
    items: [
      { label: 'Landing content', to: '/dashboard/landing', roles: BOARD },
      { label: 'Board members', to: '/dashboard/board-members', roles: BOARD },
      { label: 'Resources', to: '/dashboard/resources', roles: BOARD },
    ],
  },
  { group: 'Trainings', items: [{ label: 'Trainings', to: '/dashboard/trainings', roles: TRAININGS }] },
  {
    group: 'Directory',
    items: [
      { label: 'Applications', to: '/dashboard/applications', roles: DIRECTORY },
      { label: 'Listings', to: '/dashboard/listings', roles: DIRECTORY },
      { label: 'Renewals due', to: '/dashboard/renewals', roles: DIRECTORY },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Subscribers', to: '/dashboard/subscribers', roles: BOARD },
      { label: 'Users', to: '/dashboard/users', roles: BOARD },
    ],
  },
]

export const navFor = (role: Role) =>
  DASHBOARD_NAV.map(({ group, items }) => ({ group, items: items.filter((i) => i.roles.includes(role)) })).filter(
    (g) => g.items.length > 0,
  )

/** Where /dashboard sends each role. */
export const HOME_FOR_ROLE: Record<Role, string> = {
  board: '/dashboard',
  trainer: '/dashboard/trainings',
  directorate: '/dashboard/applications',
}

export const ROLES = { BOARD, TRAININGS, DIRECTORY }
