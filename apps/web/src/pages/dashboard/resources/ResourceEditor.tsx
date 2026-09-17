import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { ResourceInput } from '@/api/types'
import { ResourceForm } from '@/components/forms/ResourceForm'
import { DashboardPage } from '@/components/layout/DashboardLayout'
import { ErrorState, PageLoader } from '@/components/PageState'
import { Card } from '@/components/ui/card'
import { keys, useInvalidatingMutation, useResources } from '@/hooks/queries'

/** /dashboard/resources/:id */
export default function ResourceEditor() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const resources = useResources()
  const resource = resources.data?.find((r) => r.id === id)
  const back = () => navigate('/dashboard/resources')
  const update = useInvalidatingMutation((input: ResourceInput) => api.admin.updateResource(id, input), [keys.resources])
  const remove = useInvalidatingMutation(() => api.admin.deleteResource(id), [keys.resources])

  return (
    <DashboardPage title="Edit resource">
      <span className="text-[13px] text-muted-foreground">
        <Link to="/dashboard/resources" className="hover:text-primary">
          Resources
        </Link>
        &nbsp;/&nbsp; {resource?.title}
      </span>
      {resources.isLoading ? (
        <PageLoader />
      ) : !resource ? (
        <ErrorState error={resources.error ?? new Error('Resource not found.')} />
      ) : (
        <Card className="max-w-2xl p-6">
          <ResourceForm
            resource={resource}
            onSubmit={(input) => update.mutate(input, { onSuccess: back })}
            onDelete={() => confirm(`Delete "${resource.title}"?`) && remove.mutate(undefined, { onSuccess: back })}
            pending={update.isPending || remove.isPending}
            error={update.error ?? remove.error}
          />
        </Card>
      )}
    </DashboardPage>
  )
}
