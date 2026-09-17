import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { ResourceCategory } from '@/api/types'
import { DataTable } from '@/components/DataTable'
import { ResourceForm } from '@/components/forms/ResourceForm'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import { keys, useInvalidatingMutation, useResources } from '@/hooks/queries'
import { formatBytes, formatDate } from '@/lib/format'
import { RESOURCE_CATEGORY } from '@/lib/status'

type Filter = ResourceCategory | 'all'

/** /dashboard/resources. Add opens a drawer; rows link to /dashboard/resources/:id. */
export default function ResourcesAdmin() {
  const resources = useResources()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [adding, setAdding] = useState(false)
  const create = useInvalidatingMutation(api.admin.createResource, [keys.resources])

  const all = resources.data ?? []
  const rows = all.filter((r) => filter === 'all' || r.category === filter)

  return (
    <DashboardPage title="Resources">
      <Toolbar>
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All (${all.length})` },
            ...Object.entries(RESOURCE_CATEGORY).map(([value, label]) => ({ value: value as ResourceCategory, label })),
          ]}
        />
        <Button size="sm" onClick={() => setAdding(true)}>
          Add resource
        </Button>
      </Toolbar>
      <QueryState query={resources}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            empty="No resources in this category."
            columns={[
              { header: 'Title', cell: (r) => <Link to={`/dashboard/resources/${r.id}`} className="font-semibold hover:text-primary">{r.title}</Link> },
              { header: 'Type', cell: (r) => (r.kind === 'file' ? `File ${formatBytes(r.file_size_bytes)}` : 'Link') },
              { header: 'Category', cell: (r) => RESOURCE_CATEGORY[r.category] },
              { header: 'Updated', cell: (r) => formatDate(r.updated_at) },
              { header: '', cell: (r) => <Link to={`/dashboard/resources/${r.id}`} className="font-semibold text-primary">Edit</Link> },
            ]}
          />
        )}
      </QueryState>
      <Dialog open={adding} onClose={() => setAdding(false)} title="Add resource" variant="drawer">
        <ResourceForm
          onSubmit={(input) => create.mutate(input, { onSuccess: () => { setAdding(false); navigate('/dashboard/resources') } })}
          pending={create.isPending}
          error={create.error}
        />
      </Dialog>
    </DashboardPage>
  )
}
