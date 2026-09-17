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
  const training = useTraining(id)
  const backToList = () => navigate('/dashboard/trainings')

  const save = useInvalidatingMutation(
    (v: TrainingValues) => (id ? api.admin.updateTraining(id, toTrainingInput(v)) : api.admin.createTraining(toTrainingInput(v))),
    [keys.trainings],
  )
  const remove = useInvalidatingMutation(() => api.admin.deleteTraining(id!), [keys.trainings])

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
            onDelete={() => confirm(`Delete "${t.title}"? This cannot be undone.`) && remove.mutate(undefined, { onSuccess: backToList })}
            pending={save.isPending || remove.isPending}
            error={save.error ?? remove.error}
          />
        )}
      </QueryState>
    </DashboardPage>
  )
}
