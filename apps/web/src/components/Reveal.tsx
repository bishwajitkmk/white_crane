import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Fades its content up the first time it scrolls into view. `index` staggers siblings in a grid.
 * Shows immediately where IntersectionObserver is missing, so content is never stuck hidden.
 */
export function Reveal({ index = 0, className, style, ...props }: ComponentProps<'div'> & { index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div
      ref={ref}
      className={cn('reveal', visible && 'is-visible', className)}
      style={{ ...style, ['--i' as string]: index }}
      {...props}
    />
  )
}
