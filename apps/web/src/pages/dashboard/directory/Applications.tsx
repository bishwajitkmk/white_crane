import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ApplicationStatus } from '@/api/types'
import { useSession } from '@/auth/session'
import { DataTable } from '@/components/DataTable'
import { Pager } from '@/components/Pager'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { useApplicationCounts, useApplications } from '@/hooks/queries'
import { usePagedSearch } from '@/hooks/usePagedSearch'
import { formatDate } from '@/lib/format'
import { APPLICATION_STATUS } from '@/lib/status'

const ORDER: ApplicationStatus[] = ['pending', 'info_requested', 'approved', 'declined']

const waiting = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export default function Applications() {
  const { user } = useSession()
  const [status, setStatus] = useState<ApplicationStatus>('pending')
  const { search, setSearch, q, page, setPage, limit, offset } = usePagedSearch([status])
  const applications = useApplications({ status, q, limit, offset })
  const counts = useApplicationCounts(q)

  return (
    <DashboardPage title="Applications">
      <Toolbar>
        <Tabs
          value={status}
          onChange={setStatus}
          options={ORDER.map((s) => ({ value: s, label: `${APPLICATION_STATUS[s].label} (${counts.data?.[s] ?? '…'})` }))}
        />
        <Input
          aria-label="Search agency"
          placeholder="Search agency"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-[38px] md:w-[220px]"
        />
      </Toolbar>
      <QueryState query={applications}>
        {({ items, total }) => (
          <>
            <DataTable
              rows={items}
              rowKey={(a) => a.id}
              empty="No applications in this list."
              columns={[
                {
                  header: 'Agency',
                  cell: (a) => (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.agency_name}</span>
                      {a.renewal && <Badge variant="acc">Renewal</Badge>}
                    </span>
                  ),
                },
                { header: 'Location', cell: (a) => a.location },
                { header: 'Submitted', cell: (a) => formatDate(a.submitted_at) },
                {
                  header: 'Waiting',
                  cell: (a) =>
                    a.status === 'pending'
                      ? waiting(a.submitted_at)
                      : a.status === 'info_requested'
                        ? 'waiting on applicant'
                        : formatDate(a.reviewed_at),
                },
                {
                  header: 'Status',
                  cell: (a) => <Badge variant={APPLICATION_STATUS[a.status].variant}>{APPLICATION_STATUS[a.status].label}</Badge>,
                },
                {
                  header: '',
                  cell: (a) => (
                    <Link to={`/dashboard/applications/${a.id}`} className="font-semibold text-primary">
                      Review
                    </Link>
                  ),
                },
              ]}
            />
            <Pager page={page} pageSize={limit} total={total} onPage={setPage} loading={applications.isPlaceholderData} />
          </>
        )}
      </QueryState>
      {user?.role === 'directorate' && (
        <span className="text-xs text-muted-foreground">Directorate access covers Applications, Listings and Renewals.</span>
      )}
    </DashboardPage>
  )
}
