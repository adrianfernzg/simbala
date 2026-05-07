import { forwardRef } from 'react'

type Variant = 'gold' | 'outline' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  gold: 'bg-gold text-black font-semibold hover:bg-gold-light active:opacity-90',
  outline: 'border border-gold text-gold hover:bg-gold hover:text-black',
  ghost: 'text-text-secondary hover:text-gold hover:bg-surface-raised',
  dark: 'bg-surface-raised border border-border text-text-primary hover:border-gold hover:text-gold',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs tracking-widest uppercase',
  md: 'px-5 py-2.5 text-sm tracking-widest uppercase',
  lg: 'px-8 py-3.5 text-sm tracking-widest uppercase',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gold', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-none transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
          'disabled:pointer-events-none disabled:opacity-40',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
