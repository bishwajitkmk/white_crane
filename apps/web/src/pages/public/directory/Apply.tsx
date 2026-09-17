import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { ApplicationForm } from '@/components/forms/ApplicationForm'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Apply() {
  useDocumentTitle('Apply to the Directory')
  const navigate = useNavigate()
  const apply = useMutation({
    mutationFn: api.public.apply,
    onSuccess: (application) =>
      navigate('/directory/apply/submitted', { state: { email: application.contact_email } }),
  })

  return (
    <Section>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        <PageTitle>Apply to the DBT Clinical Directory</PageTitle>
        <Lede>
          Applications are reviewed by the Directorate. You will receive an email when a decision is made or if more
          information is needed.
        </Lede>
        <ApplicationForm onSubmit={(input) => apply.mutate(input)} pending={apply.isPending} error={apply.error} />
      </div>
    </Section>
  )
}
