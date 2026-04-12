import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        destructive: 'bg-danger-500 text-white hover:bg-danger-600',
        outline: 'border border-neutral-200 text-neutral-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export { default as Badge } from './Badge.vue'
export type BadgeVariants = VariantProps<typeof badgeVariants>
