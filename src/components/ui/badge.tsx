import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded text-xs font-bold px-2 py-0.5 select-none',
  {
    variants: {
      variant: {
        default: 'bg-surface-elevated text-text-muted border border-surface-border',
        red: 'bg-brand-red/20 text-brand-red-light border border-brand-red/30',
        gold: 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30',
        green: 'bg-green-500/20 text-green-400 border border-green-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
        'treasure-hunt': 'badge-th',
        limited: 'badge-limited',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
