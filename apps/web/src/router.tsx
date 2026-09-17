import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RequireRole } from '@/auth/RequireRole'
import { ROLES } from '@/auth/roles'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageLoader } from '@/components/PageState'

/** Code-split each page; the public bundle never loads dashboard code. */
const page = (load: () => Promise<{ default: ComponentType }>) => {
  const Page = lazy(load)
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  )
}

const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: page(() => import('@/pages/public/Home')) },
      { path: '/about', element: page(() => import('@/pages/public/About')) },
      { path: '/trainings', element: page(() => import('@/pages/public/trainings/TrainingsList')) },
      { path: '/trainings/upcoming', element: page(() => import('@/pages/public/trainings/UpcomingTrainings')) },
      { path: '/trainings/:slug', element: page(() => import('@/pages/public/trainings/TrainingDetail')) },
      { path: '/directory', element: page(() => import('@/pages/public/directory/Directory')) },
      { path: '/directory/apply', element: page(() => import('@/pages/public/directory/Apply')) },
      { path: '/directory/apply/submitted', element: page(() => import('@/pages/public/directory/ApplicationSubmitted')) },
      { path: '/resources', element: page(() => import('@/pages/public/Resources')) },
      { path: '/subscribed', element: page(() => import('@/pages/public/Subscribed')) },
      { path: '*', element: page(() => import('@/pages/NotFound')) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: page(() => import('@/pages/auth/Login')) },
      { path: '/forgot-password', element: page(() => import('@/pages/auth/ForgotPassword')) },
      { path: '/reset-password/:token', element: page(() => import('@/pages/auth/ResetPassword')) },
      { path: '/invite/:token', element: page(() => import('@/pages/auth/AcceptInvite')) },
    ],
  },
  {
    path: '/dashboard',
    element: <RequireRole />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: page(() => import('@/pages/dashboard/Index')) },
          { path: 'account', element: page(() => import('@/pages/dashboard/Account')) },
          {
            element: <RequireRole roles={ROLES.BOARD} />,
            children: [
              { path: 'landing', element: page(() => import('@/pages/dashboard/landing/LandingContent')) },
              { path: 'board-members', element: page(() => import('@/pages/dashboard/landing/BoardMembers')) },
              { path: 'resources', element: page(() => import('@/pages/dashboard/resources/ResourcesAdmin')) },
              { path: 'resources/:id', element: page(() => import('@/pages/dashboard/resources/ResourceEditor')) },
              { path: 'subscribers', element: page(() => import('@/pages/dashboard/subscribers/Subscribers')) },
              { path: 'users', element: page(() => import('@/pages/dashboard/users/Users')) },
            ],
          },
          {
            element: <RequireRole roles={ROLES.TRAININGS} />,
            children: [
              { path: 'trainings', element: page(() => import('@/pages/dashboard/trainings/TrainingsAdmin')) },
              { path: 'trainings/new', element: page(() => import('@/pages/dashboard/trainings/TrainingEditor')) },
              { path: 'trainings/:id', element: page(() => import('@/pages/dashboard/trainings/TrainingEditor')) },
            ],
          },
          {
            element: <RequireRole roles={ROLES.DIRECTORY} />,
            children: [
              { path: 'applications', element: page(() => import('@/pages/dashboard/directory/Applications')) },
              { path: 'applications/:id', element: page(() => import('@/pages/dashboard/directory/ApplicationReview')) },
              { path: 'listings', element: page(() => import('@/pages/dashboard/directory/Listings')) },
              { path: 'renewals', element: page(() => import('@/pages/dashboard/directory/Renewals')) },
            ],
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
