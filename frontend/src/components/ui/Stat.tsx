interface StatProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function Stat({ label, value, sub, accent }: StatProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 fade-up">
      <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-3xl font-semibold tracking-tight ${accent ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--text-3)] mt-1">{sub}</p>}
    </div>
  )
}
