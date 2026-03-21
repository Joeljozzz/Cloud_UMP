import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../lib/store'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const DEMOS = [
    { label: 'Super Admin', sub: 'Full control', email: 'admin@ump.dev', pass: 'admin123', color: 'border-purple-500/40 hover:border-purple-400/60' },
    { label: 'Manager', sub: 'Analytics + agents', email: 'manager@ump.dev', pass: 'user123', color: 'border-blue-500/40 hover:border-blue-400/60' },
    { label: 'User', sub: 'Chat only', email: 'user@ump.dev', pass: 'user123', color: 'border-teal-500/40 hover:border-teal-400/60' },
  ]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 border-r border-[#1e2535]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Cloud UMP</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Control who does what —<br />
            <span className="text-blue-400">even your AI agents.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            A user management portal with constitutional AI guardrails. Agents get scoped access,
            persistent skill rules, and immutable safety constraints — so they never go rogue.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🔐', label: 'Role-based access control' },
              { icon: '🤖', label: 'Constitutional AI agents' },
              { icon: '📋', label: 'Persistent skill memory' },
              { icon: '🛡️', label: 'Immutable guardrail layer' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-sm text-gray-400 bg-[#161b27] rounded-xl px-3 py-2.5 border border-[#1e2535]">
                <span className="text-base">{f.icon}</span>{f.label}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">© 2026 Cloud UMP · Joel Jose · Open source</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
            <p className="text-gray-400 text-sm">Access your portal</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3.5 py-2.5 bg-[#161b27] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#161b27] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}Sign in
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1e2535]">
            <p className="text-xs text-gray-500 mb-3 text-center">Demo accounts — click to fill</p>
            <div className="space-y-2">
              {DEMOS.map(d => (
                <button key={d.email} onClick={() => { setEmail(d.email); setPassword(d.pass) }}
                  className={`w-full text-left px-3.5 py-2.5 bg-[#161b27] border ${d.color} rounded-xl text-sm transition-colors`}>
                  <span className="font-medium text-white">{d.label}</span>
                  <span className="text-gray-500 ml-2">· {d.sub}</span>
                  <span className="block text-xs text-gray-600 mt-0.5">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
