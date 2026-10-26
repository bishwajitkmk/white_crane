import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <PageHero center className="pb-20 md:pb-28" eyebrow="404" title="Page not found" lede="The page you were looking for does not exist or has moved.">
      <ButtonLink to="/" variant="secondary" className="mt-2">
        Back to Home
      </ButtonLink>
    </PageHero>
  )
}
