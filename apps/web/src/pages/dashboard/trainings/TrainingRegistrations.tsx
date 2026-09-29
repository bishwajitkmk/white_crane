import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { DataTable } from '@/components/DataTable'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Input } from '@/components/ui/input'
import { keys, useInvalidatingMutation, useRegistrations, useTraining } from '@/hooks/queries'
import { formatDate } from '@/lib/format'

/** /dashboard/trainings/:id/registrations: sign-ups from the built-in registration form. */
export default function TrainingRegistrations() {
  const { id = '' } = useParams()
  const training = useTraining(id)
  const registrations = useRegistrations(id)
  const [search, setSearch] = useState('')
  const remove = useInvalidatingMutation((rid: string) => api.admin.deleteRegistration(id, rid), [keys.trainings])

  const t = training.data
  const all = registrations.data ?? []
  const needle = search.toLowerCase()
  const rows = all.filter((r) => [r.full_name, r.email, r.organization].some((v) => v.toLowerCase().includes(needle)))

  return (
    <DashboardPage title="Registrations">
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">
          <Link to="/dashboard/trainings" className="hover:text-primary">
            Trainings
          </Link>
          &nbsp;/&nbsp;
          {t ? (
            <Link to={`/dashboard/trainings/${t.id}`} className="hover:text-primary">
              {t.title}
            </Link>
          ) : (
            '...'
          )}
          &nbsp;/&nbsp; {all.length}
          {t?.capacity ? ` of ${t.capacity}` : ''} registered
        </span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input aria-label="Search registrations" placeholder="Search name, email, organization" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[38px] sm:w-[260px]" />
          <a href={api.admin.registrationsExportUrl(id)} download={`registrations-${t?.slug ?? id}.csv`} className={buttonVariants({ size: 'sm' })}>
            Export CSV
          </a>
        </div>
      </Toolbar>
      {t?.registration_url && (
        <p className="text-[13px] text-muted-foreground">
          This training has an external registration URL, so the built-in form is turned off. Clear the URL in the editor to take sign-ups here.
        </p>
      )}
      <QueryState query={registrations}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            empty={all.length ? 'No registrations match.' : 'No one has registered yet.'}
            columns={[
              { header: 'Name', cell: (r) => <span className="font-semibold">{r.full_name}</span> },
              { header: 'Email', cell: (r) => <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a> },
              { header: 'Organization', cell: (r) => r.organization },
              { header: 'Role', cell: (r) => r.role },
              { header: 'Phone', cell: (r) => r.phone },
              { header: 'Notes', cell: (r) => <span className="line-clamp-2 max-w-[280px]" title={r.notes}>{r.notes}</span> },
              { header: 'Registered', cell: (r) => formatDate(r.registered_at) },
              {
                header: '',
                cell: (r) => (
                  <Button variant="link" disabled={remove.isPending} onClick={() => confirm(`Remove ${r.full_name}'s registration? This frees their seat.`) && remove.mutate(r.id)}>
                    Remove
                  </Button>
                ),
              },
            ]}
          />
        )}
      </QueryState>
    </DashboardPage>
  )
}
