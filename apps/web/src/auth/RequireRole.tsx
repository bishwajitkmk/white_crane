import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/api/types'
import { PageLoader } from '@/components/PageState'
import { HOME_FOR_ROLE } from './roles'
import { useSession } from './session'

/**
 * Route guard. Without a session it sends the user to /login (and back afterwards).
 * With the wrong role it sends them to their own dashboard home. The API enforces the
 * same rules with require_role; this only keeps the UI honest.
 */
export function RequireRole({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_FOR_ROLE[user.role]} replace />
  return <Outlet />
}
