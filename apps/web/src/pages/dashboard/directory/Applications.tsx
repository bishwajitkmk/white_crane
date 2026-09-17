import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ApplicationStatus } from '@/api/types'
import { useSession } from '@/auth/session'
import { DataTable } from '@/components/DataTable'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { useApplications } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { APPLICATION_STATUS } from '@/lib/status'

const ORDER: ApplicationStatus[] = ['pending', 'info_requested', 'approved', 'declined']

const waiting = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export default function Applications() {
  const { user } = useSession()
  const applications = useApplications()
  const [status, setStatus] = useState<ApplicationStatus>('pending')
  const [search, setSearch] = useState('')

  const all = applications.data ?? []
  const rows = all.filter((a) => a.status === status && a.agency_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardPage title="Applications">
      <Toolbar>
        <Tabs
          value={status}
          onChange={setStatus}
          options={ORDER.map((s) => ({ value: s, label: `${APPLICATION_STATUS[s].label} (${all.filter((a) => a.status === s).length})` }))}
        />
        <Input aria-label="Search agency" placeholder="Search agency" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[38px] md:w-[220px]" />
      </Toolbar>
      <QueryState query={applications}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(a) => a.id}
            empty="No applications in this list."
            columns={[
              { header: 'Agency', cell: (a) => <span className="font-semibold">{a.agency_name}</span> },
              { header: 'Location', cell: (a) => a.location },
              { header: 'Submitted', cell: (a) => formatDate(a.submitted_at) },
              {
                header: 'Waiting',
                cell: (a) =>
                  a.status === 'pending' ? waiting(a.submitted_at) : a.status === 'info_requested' ? 'waiting on applicant' : formatDate(a.reviewed_at),
              },
              { header: 'Status', cell: (a) => <Badge variant={APPLICATION_STATUS[a.status].variant}>{APPLICATION_STATUS[a.status].label}</Badge> },
              { header: '', cell: (a) => <Link to={`/dashboard/applications/${a.id}`} className="font-semibold text-primary">Review</Link> },
            ]}
          />
        )}
      </QueryState>
      {user?.role === 'directorate' && (
        <span className="text-xs text-muted-foreground">Directorate access covers Applications, Listings and Renewals.</span>
      )}
    </DashboardPage>
  )
}
