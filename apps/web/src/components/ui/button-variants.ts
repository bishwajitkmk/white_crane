import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:brightness-110',
        secondary: 'border-border bg-background text-foreground hover:bg-surface',
        destructive: 'border-destructive bg-destructive text-primary-foreground hover:brightness-110',
        ghost: 'border-transparent bg-transparent hover:bg-surface',
        link: 'border-transparent bg-transparent p-0 text-primary hover:underline',
      },
      size: {
        default: 'h-10 px-[18px]',
        sm: 'h-[38px] px-3.5',
        icon: 'size-9',
      },
      block: { true: 'w-full' },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
