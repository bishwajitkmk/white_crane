import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { ButtonLink } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <Section className="items-center py-24 text-center">
      <PageTitle>Page not found</PageTitle>
      <Lede>The page you were looking for does not exist or has moved.</Lede>
      <ButtonLink to="/">Back to Home</ButtonLink>
    </Section>
  )
}
