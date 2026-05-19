import { cn } from '@/lib/utils'

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ShimmerSkeleton({ className, ...props }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-elevated',
        'before:absolute before:inset-0',
        'before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/10 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}
