import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand-red hover:bg-brand-red-light text-white shadow-lg shadow-brand-red/20',
        secondary: 'bg-surface-elevated hover:bg-surface-border text-text-primary border border-surface-border',
        ghost: 'text-text-muted hover:text-text-primary hover:bg-surface-elevated',
        outline: 'border border-brand-red text-brand-red hover:bg-brand-red hover:text-white',
        gold: 'bg-brand-gold hover:bg-yellow-400 text-black shadow-lg shadow-brand-gold/20',
        destructive: 'bg-red-700 hover:bg-red-600 text-white',
      },
      size: {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-5 py-2.5',
        lg: 'text-base px-7 py-3',
        icon: 'p-2 w-9 h-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, asChild = false, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }))

    // asChild: clone first child element and apply button classes to it
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        className: cn(classes, (children as React.ReactElement<Record<string, unknown>>).props.className as string),
      })
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
