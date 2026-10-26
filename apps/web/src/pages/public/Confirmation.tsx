import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Shared centred success screen (Application submitted, Subscribed, Registered, Message sent). */
export function Confirmation({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  useDocumentTitle(title)
  return (
    <PageHero
      center
      className="pb-20 md:pb-28"
      top={
        <div className="flex size-16 items-center justify-center rounded-full bg-white/15 text-mist ring-8 ring-white/5">
          <CheckCircle2 className="size-8" aria-hidden />
        </div>
      }
      title={title}
      lede={children}
    >
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">{actions}</div>
    </PageHero>
  )
}
