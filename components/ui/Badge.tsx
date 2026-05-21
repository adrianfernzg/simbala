type Variant = 'gold' | 'dark' | 'success' | 'warning' | 'danger' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  gold: 'border border-gold text-gold bg-transparent',
  dark: 'border border-border text-text-secondary bg-surface-raised',
  success: 'border border-green-700 text-green-400 bg-transparent',
  warning: 'border border-yellow-700 text-yellow-400 bg-transparent',
  danger: 'border border-red-700 text-red-400 bg-transparent',
  pending: 'border border-yellow-700 text-yellow-400 bg-transparent',
  processing: 'border border-blue-700 text-blue-400 bg-transparent',
  shipped: 'border border-purple-700 text-purple-400 bg-transparent',
  delivered: 'border border-green-700 text-green-400 bg-transparent',
  cancelled: 'border border-red-700 text-red-400 bg-transparent',
}

export function Badge({ variant = 'gold', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-widest uppercase ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
