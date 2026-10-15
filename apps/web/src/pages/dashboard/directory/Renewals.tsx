import { useState } from 'react'
import { api, type RenewalWindow } from '@/api/endpoints'
import { DataTable } from '@/components/DataTable'
import { Pager } from '@/components/Pager'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { keys, useInvalidatingMutation, useListings } from '@/hooks/queries'
import { PAGE_SIZE } from '@/hooks/usePagedSearch'
import { daysUntil, formatDate } from '@/lib/format'

const renewalLink = `${window.location.origin}/directory/apply?renewal=1`

export default function Renewals() {
  const [range, setRange] = useState<RenewalWindow>('next_30')
  const [page, setPage] = useState(1)
  // limit 1: only the totals are needed for the tab labels.
  const next30 = useListings({ renewal: 'next_30', limit: 1 })
  const next90 = useListings({ renewal: 'next_90', limit: 1 })
  const overdue = useListings({ renewal: 'overdue', limit: 1 })
  const current = useListings({ renewal: range, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
  const pick = (window: RenewalWindow) => {
    setRange(window)
    setPage(1)
  }
  const renew = useInvalidatingMutation(api.admin.renewListing, [keys.listings])

  return (
    <DashboardPage title="Renewals due">
      <Toolbar>
        <Tabs
          value={range}
          onChange={pick}
          options={[
            { value: 'next_30', label: `Next 30 days (${next30.data?.total ?? 0})` },
            { value: 'next_90', label: `Next 90 days (${next90.data?.total ?? 0})` },
            { value: 'overdue', label: `Overdue (${overdue.data?.total ?? 0})` },
          ]}
        />
        <span className="text-xs text-muted-foreground">Automated reminder emails are a future phase. Contact teams manually for now.</span>
      </Toolbar>
      <QueryState query={current}>
        {({ items, total }) => (
          <>
            <DataTable
              rows={items}
              rowKey={(l) => l.id}
              empty="Nothing due in this window."
              columns={[
                { header: 'Agency', cell: (l) => <span className="font-semibold">{l.agency_name}</span> },
                {
                  header: 'Contact',
                  cell: (l) => (
                    <a href={`mailto:${l.contact_email}`} className="text-primary">
                      {l.contact_email}
                    </a>
                  ),
                },
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
            <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} loading={current.isPlaceholderData} />
          </>
        )}
      </QueryState>
      <span className="text-[13px] text-muted-foreground">
        Teams renew by submitting a fresh attestation at {renewalLink}. Approving it renews their listing for a year. Mark renewed extends a
        listing without a new attestation, for exceptions only. Expired listings hide automatically but are not deleted.
      </span>
    </DashboardPage>
  )
}
