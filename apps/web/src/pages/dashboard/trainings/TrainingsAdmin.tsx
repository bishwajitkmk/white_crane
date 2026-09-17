import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Training } from '@/api/types'
import { useSession } from '@/auth/session'
import { DataTable } from '@/components/DataTable'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { useTrainings } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { TRAINING_STATUS } from '@/lib/status'

type Filter = 'open' | 'upcoming' | 'past'

const bucket = (t: Training): Filter =>
  t.status === 'upcoming' ? 'upcoming' : t.starts_at && new Date(t.ends_at ?? t.starts_at) < new Date() ? 'past' : 'open'

export default function TrainingsAdmin() {
  const { user } = useSession()
  const trainings = useTrainings()
  const [filter, setFilter] = useState<Filter>('open')
  const [search, setSearch] = useState('')

  const all = trainings.data ?? []
  const count = (f: Filter) => all.filter((t) => bucket(t) === f).length
  const rows = all.filter((t) => bucket(t) === filter && t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardPage title="Trainings">
      <Toolbar>
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'open', label: `Open (${count('open')})` },
            { value: 'upcoming', label: `Upcoming (${count('upcoming')})` },
            { value: 'past', label: `Past (${count('past')})` },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input aria-label="Search trainings" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[38px] sm:w-[220px]" />
          <ButtonLink to="/dashboard/trainings/new" size="sm">
            Add training
          </ButtonLink>
        </div>
      </Toolbar>
      <QueryState query={trainings}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(t) => t.id}
            empty="No trainings in this list."
            columns={[
              { header: 'Title', cell: (t) => <Link to={`/dashboard/trainings/${t.id}`} className="font-semibold hover:text-primary">{t.title}</Link> },
              { header: 'Date', cell: (t) => (t.starts_at ? formatDate(t.starts_at) : t.expected_label || 'TBD') },
              { header: 'Trainer', cell: (t) => t.trainers || 'TBD' },
              { header: 'Status', cell: (t) => <Badge variant={TRAINING_STATUS[t.status].variant}>{TRAINING_STATUS[t.status].label}</Badge> },
              { header: 'Registration', cell: (t) => (t.registration_url ? <a href={t.registration_url} target="_blank" rel="noreferrer" className="text-primary">External link</a> : 'Not yet') },
              { header: '', cell: (t) => <Link to={`/dashboard/trainings/${t.id}`} className="font-semibold text-primary">Edit</Link> },
            ]}
          />
        )}
      </QueryState>
      {user?.role === 'trainer' && (
        <span className="text-xs text-muted-foreground">You can manage trainings. Contact a Board member for other site changes.</span>
      )}
    </DashboardPage>
  )
}
