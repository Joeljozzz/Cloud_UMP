interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'accent' | 'outline'
  size?: 'sm' | 'md'
}

const variants = {
  default:  'bg-[var(--bg-subtle)] text-[var(--text-2)] border-[var(--border)]',
  success:  'bg-[var(--success-bg)] text-[var(--success)] border-transparent',
  danger:   'bg-[var(--danger-bg)] text-[var(--danger)] border-transparent',
  warning:  'bg-[var(--warning-bg)] text-[var(--warning)] border-transparent',
  accent:   'bg-[var(--accent-bg)] text-[var(--accent)] border-transparent',
  outline:  'bg-transparent text-[var(--text-2)] border-[var(--border)]',
}

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 border rounded-md font-medium ${size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'} ${variants[variant]}`}>
      {children}
    </span>
  )
}
