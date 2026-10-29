import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,translate] duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(15_42_59/0.12),0_8px_20px_-10px_rgb(39_74_95/0.7)] hover:border-ink hover:bg-ink hover:-translate-y-px',
        secondary: 'border-border bg-background text-foreground shadow-soft hover:border-ink/25 hover:-translate-y-px',
        destructive: 'border-destructive bg-destructive text-primary-foreground hover:brightness-110',
        ghost: 'border-transparent bg-transparent hover:bg-surface',
        link: 'border-transparent bg-transparent p-0 text-primary hover:underline',
      },
      size: {
        default: 'h-11 px-6 text-[15px]',
        sm: 'h-9 px-4 text-sm',
        icon: 'size-9',
      },
      block: { true: 'w-full' },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

/** Frosted look for a `secondary` button sitting on a navy band (the menu panel, closing bands). */
export const ON_DARK = 'border-white/30 bg-white/10 text-white shadow-none md:backdrop-blur-sm hover:border-white/50 hover:bg-white/20'
