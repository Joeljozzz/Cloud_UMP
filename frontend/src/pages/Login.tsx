import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../lib/store'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.access_token)
      navigate('/app/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link to="/" className="flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Shield size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold">Cloud UMP</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-up">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Sign in</h1>
            <p className="text-sm text-[var(--text-2)]">Access your workspace</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all placeholder:text-[var(--text-3)]"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all placeholder:text-[var(--text-3)]"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo hint — only user account shown */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-3)] mb-3 uppercase tracking-widest font-medium">Demo access</p>
            <button onClick={() => { setEmail('user@ump.dev'); setPassword('user123') }}
              className="w-full text-left px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Guest account</p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5 font-mono">user@ump.dev</p>
                </div>
                <ArrowRight size={13} className="text-[var(--text-3)] group-hover:text-[var(--text-2)] transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="py-4 text-center">
        <p className="text-xs text-[var(--text-3)]">
          Built by <a href="https://github.com/Joeljozzz" target="_blank" rel="noreferrer"
            className="hover:text-[var(--text-2)] transition-colors">Joel Jose</a>
        </p>
      </div>
    </div>
  )
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
