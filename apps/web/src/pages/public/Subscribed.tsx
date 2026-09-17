import { ButtonLink } from '@/components/ui/button'
import { Confirmation } from './Confirmation'

export default function Subscribed() {
  return (
    <Confirmation
      title="You are on the list"
      actions={
        <ButtonLink to="/" variant="secondary">
          Back to Home
        </ButtonLink>
      }
    >
      A confirmation was sent to your email. You can unsubscribe from any message.
    </Confirmation>
  )
}
