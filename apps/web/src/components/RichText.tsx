import { textBlocks } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Renders a CMS text block: paragraphs, "- " bullets and "1. " numbered lists. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex max-w-[720px] flex-col gap-4 text-base text-muted-foreground', className)}>
      {textBlocks(text).map((block, i) => {
        if (block.type === 'p') return <p key={i}>{block.text}</p>
        const List = block.type
        return (
          <List key={i} className={cn('flex flex-col gap-2 pl-6', List === 'ul' ? 'list-disc' : 'list-decimal')}>
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                {item}
              </li>
            ))}
          </List>
        )
      })}
    </div>
  )
}
