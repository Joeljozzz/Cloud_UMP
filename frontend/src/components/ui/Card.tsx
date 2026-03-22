interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
