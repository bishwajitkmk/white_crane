import type { ComponentProps } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button-variants'

export function Button({ className, variant, size, block, type = 'button', ...props }: ComponentProps<'button'> & ButtonVariantProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}

/** Router link styled as a button. */
export function ButtonLink({ className, variant, size, block, ...props }: LinkProps & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}
