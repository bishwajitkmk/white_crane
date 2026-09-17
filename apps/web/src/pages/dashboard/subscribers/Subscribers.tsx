import { useState } from 'react'
import { api } from '@/api/endpoints'
import { DataTable } from '@/components/DataTable'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Input } from '@/components/ui/input'
import { keys, useInvalidatingMutation, useSubscribers } from '@/hooks/queries'
import { formatDate } from '@/lib/format'

export default function Subscribers() {
  const subscribers = useSubscribers()
  const [search, setSearch] = useState('')
  const remove = useInvalidatingMutation(api.admin.deleteSubscriber, [keys.subscribers])

  const all = subscribers.data ?? []
  const rows = all.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardPage title="Subscribers">
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">
          {all.length} subscribers. Sending newsletters is a future phase; export and use your email tool.
        </span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input aria-label="Search email" placeholder="Search email" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[38px] sm:w-[220px]" />
          <a href={api.admin.subscribersExportUrl()} download="subscribers.csv" className={buttonVariants({ size: 'sm' })}>
            Export CSV
          </a>
        </div>
      </Toolbar>
      <QueryState query={subscribers}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(s) => s.id}
            empty="No subscribers match."
            columns={[
              { header: 'Email', cell: (s) => s.email },
              { header: 'Subscribed', cell: (s) => formatDate(s.subscribed_at) },
              { header: 'Source', cell: (s) => s.source },
              { header: 'Status', cell: (s) => (s.confirmed ? <Badge variant="ok">Confirmed</Badge> : <Badge variant="warn">Unconfirmed</Badge>) },
              {
                header: '',
                cell: (s) => (
                  <Button variant="link" disabled={remove.isPending} onClick={() => confirm(`Remove ${s.email}?`) && remove.mutate(s.id)}>
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
