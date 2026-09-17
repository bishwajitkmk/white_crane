import { Link, Navigate } from 'react-router-dom'
import { HOME_FOR_ROLE } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { DataTable } from '@/components/DataTable'
import { QueryState } from '@/components/PageState'
import { StatCard } from '@/components/StatCard'
import { DashboardPage } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { useSummary } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { APPLICATION_STATUS } from '@/lib/status'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/** /dashboard: Board overview. Trainer and Directorate are redirected to their only section. */
export default function DashboardIndex() {
  const { user } = useSession()
  if (user && user.role !== 'board') return <Navigate to={HOME_FOR_ROLE[user.role]} replace />
  return <BoardOverview name={user?.name.split(' ')[0] ?? ''} />
}

function BoardOverview({ name }: { name: string }) {
  const summary = useSummary()

  return (
    <DashboardPage title="Dashboard">
      <span className="text-muted-foreground">
        {greeting()}, {name}. Here is what needs attention.
      </span>
      <QueryState query={summary}>
        {(s) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Pending applications"
                value={s.pending_applications}
                note={`${s.pending_over_7_days} waiting more than 7 days`}
                to="/dashboard/applications"
              />
              <StatCard label="Listings due for renewal" value={s.renewals_due_60_days} note="Next 60 days" to="/dashboard/renewals" />
              <StatCard label="Upcoming trainings" value={s.upcoming_trainings_30_days} note="Next 30 days" to="/dashboard/trainings" />
              <StatCard label="Subscribers" value={s.subscribers} note={`+${s.subscribers_this_month} this month`} to="/dashboard/subscribers" />
            </div>
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
              <Card>
                <CardTitle>Recent applications</CardTitle>
                <DataTable
                  rows={s.recent_applications}
                  rowKey={(a) => a.id}
                  columns={[
                    { header: 'Agency', cell: (a) => <Link to={`/dashboard/applications/${a.id}`} className="font-semibold hover:text-primary">{a.agency_name}</Link> },
                    { header: 'Submitted', cell: (a) => formatDate(a.submitted_at) },
                    { header: 'Status', cell: (a) => <Badge variant={APPLICATION_STATUS[a.status].variant}>{APPLICATION_STATUS[a.status].label}</Badge> },
                  ]}
                />
              </Card>
              <Card>
                <CardTitle>Quick actions</CardTitle>
                <ButtonLink to="/dashboard/trainings/new" variant="secondary">Add training</ButtonLink>
                <ButtonLink to="/dashboard/landing" variant="secondary">Edit landing content</ButtonLink>
                <ButtonLink to="/dashboard/users?invite=1" variant="secondary">Invite a user</ButtonLink>
                <ButtonLink to="/dashboard/subscribers" variant="secondary">Export subscribers</ButtonLink>
              </Card>
            </div>
          </>
        )}
      </QueryState>
    </DashboardPage>
  )
}
