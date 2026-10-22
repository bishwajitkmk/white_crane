import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { TrainingForm } from '@/components/forms/TrainingForm'
import { DashboardPage } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { keys, useInvalidatingMutation, useTraining } from '@/hooks/queries'
import type { TrainingValues } from '@/lib/schemas'
import { emptyTrainingValues, toTrainingInput, toTrainingValues } from '@/lib/training'

/** /dashboard/trainings/new and /dashboard/trainings/:id */
export default function TrainingEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const training = useTraining(id)
  const backToList = () => navigate('/dashboard/trainings')

  const save = useInvalidatingMutation(
    (v: TrainingValues) => (id ? api.admin.updateTraining(id, toTrainingInput(v)) : api.admin.createTraining(toTrainingInput(v))),
    [keys.trainings],
  )
  // Mark stale without refetching: the deleted training is still on screen, so a refetch would 404 and flash the
  // error state. The list and summary refetch when they mount.
  const remove = useMutation({
    mutationFn: () => api.admin.deleteTraining(id!),
    onSuccess: () => {
      for (const queryKey of [keys.trainings, keys.summary]) void queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
      backToList()
    },
  })

  const submit = (v: TrainingValues) => save.mutate(v, { onSuccess: backToList })

  if (!id) {
    return (
      <DashboardPage title="Add training">
        <TrainingForm defaultValues={emptyTrainingValues} breadcrumb="New training" onSubmit={submit} pending={save.isPending} error={save.error} />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage title="Edit training">
      <QueryState query={training}>
        {(t) => (
          <TrainingForm
            defaultValues={toTrainingValues(t)}
            breadcrumb={t.title}
            onSubmit={submit}
            onDelete={() => {
              const registered = t.registration_count ? ` and its ${t.registration_count} registrations` : ''
              if (confirm(`Delete "${t.title}"${registered}? This cannot be undone.`)) remove.mutate()
            }}
            pending={save.isPending || remove.isPending}
            error={save.error ?? remove.error}
          />
        )}
      </QueryState>
    </DashboardPage>
  )
}
