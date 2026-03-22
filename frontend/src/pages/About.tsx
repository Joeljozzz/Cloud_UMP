import { useNavigate } from 'react-router-dom'
import { Shield, Layers, Lock, ArrowRight, Github, ChevronRight } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'

const PILLARS = [
  {
    icon: Lock,
    title: 'Constitutional layer',
    body: 'Every agent inherits immutable rules that no configuration can override. Confirm before delete. Stay in scope. No impersonation. Always audited.',
  },
  {
    icon: Layers,
    title: 'Persistent skill memory',
    body: 'Skills are domain rules stored per agent — they survive across every conversation. The agent always remembers what it\'s allowed and not allowed to do.',
  },
  {
    icon: Shield,
    title: 'Role-based access',
    body: 'Users, managers, admins and super-admins each see exactly what they need. Agents are scoped to the user talking to them — no cross-contamination.',
  },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Cloud UMP</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="https://github.com/Joeljozzz/Cloud_UMP" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">
            <Github size={14} />
            <span className="hidden sm:inline">Source</span>
          </a>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity">
            Sign in <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-medium rounded-full border border-[var(--accent)]/20 mb-8 fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
          Constitutional AI access control
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 fade-up-1">
          Who controls<br />
          <span style={{ color: 'var(--accent)' }}>your AI agents?</span>
        </h1>
        <p className="text-lg text-[var(--text-2)] max-w-2xl mx-auto leading-relaxed mb-10 fade-up-2">
          Cloud UMP is a user and agent management portal built around one idea —
          that AI agents need immutable constraints, not just configuration.
          Built by Joel Jose as an open-source proof of concept.
        </p>
        <div className="flex items-center justify-center gap-3 fade-up-3">
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
            Try the demo <ArrowRight size={15} />
          </button>
          <a href="https://github.com/Joeljozzz/Cloud_UMP" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
            <Github size={15} /> View source
          </a>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PILLARS.map((p, i) => (
            <div key={p.title}
              className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 fade-up-${i + 2}`}>
              <div className="h-9 w-9 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center mb-4">
                <p.icon size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-semibold text-sm mb-2">{p.title}</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 3-layer model */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 fade-up">
          <h2 className="text-xl font-semibold mb-2">The three-layer model</h2>
          <p className="text-sm text-[var(--text-2)] mb-8">Every agent prompt is assembled in this exact order at runtime.</p>
          <div className="space-y-3">
            {[
              { n: '01', label: 'Constitutional rules', sub: 'Hardcoded — cannot be removed by anyone', color: 'var(--danger)' },
              { n: '02', label: 'Persistent skills', sub: 'Stored per agent — survive all conversations', color: 'var(--warning)' },
              { n: '03', label: 'Agent configuration', sub: 'What the admin wrote — the agent\'s purpose', color: 'var(--accent)' },
            ].map(layer => (
              <div key={layer.n} className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)]">
                <span className="font-mono text-xs text-[var(--text-3)]">{layer.n}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{layer.label}</p>
                  <p className="text-xs text-[var(--text-2)]">{layer.sub}</p>
                </div>
                <div className="h-2 w-2 rounded-full" style={{ background: layer.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-3)]">
            Designed and built by{' '}
            <a href="https://github.com/Joeljozzz" target="_blank" rel="noreferrer"
              className="text-[var(--text-2)] hover:text-[var(--text)] transition-colors font-medium">
              Joel Jose
            </a>
            {' '}· Open source · Mumbai
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--text-3)]">
            <button onClick={() => navigate('/login')} className="hover:text-[var(--text)] transition-colors">Sign in</button>
            <a href="https://github.com/Joeljozzz/Cloud_UMP" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
