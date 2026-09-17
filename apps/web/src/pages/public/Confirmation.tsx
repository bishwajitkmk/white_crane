import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Lede, PageTitle, Section } from '@/components/layout/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Shared centred success screen (Application submitted, Subscribed). */
export function Confirmation({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  useDocumentTitle(title)
  return (
    <Section className="items-center gap-4 py-20 text-center md:py-[120px]">
      <div className="flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>
      <PageTitle>{title}</PageTitle>
      <Lede className="max-w-[600px]">{children}</Lede>
      <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
    </Section>
  )
}
