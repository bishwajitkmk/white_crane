import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { ContactTopic } from '@/api/types'
import { ContactForm } from '@/components/forms/ContactForm'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { ButtonLink } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CONTACT_TOPIC } from '@/lib/status'
import { Confirmation } from './Confirmation'

const isTopic = (value: string | null): value is ContactTopic => !!value && Object.hasOwn(CONTACT_TOPIC, value)

/** /contact, optionally /contact?topic=consultation to preselect the topic. */
export default function Contact() {
  useDocumentTitle('Contact')
  const [params] = useSearchParams()
  const requested = params.get('topic')
  const topic = isTopic(requested) ? requested : 'general'
  const message = useMutation({ mutationFn: api.public.contact })

  if (message.isSuccess) {
    return (
      <Confirmation
        title="Message sent"
        actions={
          <>
            <ButtonLink to="/" variant="secondary">
              Back to Home
            </ButtonLink>
            <ButtonLink to="/trainings" variant="secondary">
              Browse Trainings
            </ButtonLink>
          </>
        }
      >
        Thank you for reaching out. A member of the White Crane Board will reply to your email.
      </Confirmation>
    )
  }

  return (
    <Section>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        <PageTitle>Contact White Crane</PageTitle>
        <Lede>
          Questions about training, consultation for your team, or the DBT Clinical Directory? Send us a message and
          we'll get back to you.
        </Lede>
        <ContactForm topic={topic} onSubmit={(input) => message.mutate(input)} pending={message.isPending} error={message.error} />
      </div>
    </Section>
  )
}
