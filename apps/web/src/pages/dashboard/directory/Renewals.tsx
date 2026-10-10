import { useState } from 'react'
import { api, type RenewalWindow } from '@/api/endpoints'
import { DataTable } from '@/components/DataTable'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { keys, useInvalidatingMutation, useListings } from '@/hooks/queries'
import { daysUntil, formatDate } from '@/lib/format'

const renewalLink = `${window.location.origin}/directory/apply?renewal=1`

export default function Renewals() {
  const [range, setRange] = useState<RenewalWindow>('next_30')
  const next30 = useListings('next_30')
  const next90 = useListings('next_90')
  const overdue = useListings('overdue')
  const current = { next_30: next30, next_90: next90, overdue }[range]
  const renew = useInvalidatingMutation(api.admin.renewListing, [keys.listings])

  return (
    <DashboardPage title="Renewals due">
      <Toolbar>
        <Tabs
          value={range}
          onChange={setRange}
          options={[
            { value: 'next_30', label: `Next 30 days (${next30.data?.length ?? 0})` },
            { value: 'next_90', label: `Next 90 days (${next90.data?.length ?? 0})` },
            { value: 'overdue', label: `Overdue (${overdue.data?.length ?? 0})` },
          ]}
        />
        <span className="text-xs text-muted-foreground">Automated reminder emails are a future phase. Contact teams manually for now.</span>
      </Toolbar>
      <QueryState query={current}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(l) => l.id}
            empty="Nothing due in this window."
            columns={[
              { header: 'Agency', cell: (l) => <span className="font-semibold">{l.agency_name}</span> },
              { header: 'Contact', cell: (l) => <a href={`mailto:${l.contact_email}`} className="text-primary">{l.contact_email}</a> },
              { header: 'Last attested', cell: (l) => formatDate(l.attested_at) },
              { header: 'Renewal due', cell: (l) => formatDate(l.renewal_due_at) },
              { header: 'Days left', cell: (l) => daysUntil(l.renewal_due_at) },
              {
                header: 'Action',
                cell: (l) => (
                  <Button variant="link" disabled={renew.isPending} onClick={() => renew.mutate(l.id)}>
                    Mark renewed
                  </Button>
                ),
              },
            ]}
          />
        )}
      </QueryState>
      <span className="text-[13px] text-muted-foreground">
        Teams renew by submitting a fresh attestation at {renewalLink}. Approving it renews their listing for a year. Mark
        renewed extends a listing without a new attestation, for exceptions only. Expired listings hide automatically but are not
        deleted.
      </span>
    </DashboardPage>
  )
}
