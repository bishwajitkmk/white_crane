import { useLocation } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/button'
import { Confirmation } from '../Confirmation'

export default function ApplicationSubmitted() {
  const email = (useLocation().state as { email?: string } | null)?.email

  return (
    <Confirmation
      title="Application received"
      actions={
        <>
          <ButtonLink to="/directory" variant="secondary">
            Back to Directory
          </ButtonLink>
          <ButtonLink to="/trainings" variant="secondary">
            Browse Trainings
          </ButtonLink>
        </>
      }
    >
      We emailed a confirmation{email ? ` to ${email}` : ''}. The Directorate reviews applications and will contact you if
      more information is needed.
    </Confirmation>
  )
}
