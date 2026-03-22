import { useEffect, useState } from 'react'
import { Search, Plus, UserCheck, UserX, Shield, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const ROLE_VARIANT: Record<string, any> = {
  SUPER_ADMIN: 'accent', ADMIN: 'accent', MANAGER: 'warning', USER: 'success', VIEWER: 'default',
}

export default function Users() {
  const { user } = useAuthStore()
  const role = user?.role || ''
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', role: 'VIEWER', password: 'changeme123' })

  useEffect(() => { loadUsers() }, [search])

  async function loadUsers() {
    const { data } = await api.get(`/users?search=${encodeURIComponent(search)}&limit=50`)
    setUsers(data.users)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/users', form)
      await loadUsers()
      setShowCreate(false)
      setForm({ email: '', name: '', role: 'VIEWER', password: 'changeme123' })
    } catch {}
    setLoading(false)
  }

  async function toggleStatus(id: string, current: string) {
    await api.patch(`/users/${id}`, { status: current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u))
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">{users.length} accounts</p>
        </div>
        {can(role, 'users:create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={14} />Add user
          </button>
        )}
      </div>

      <div className="relative fade-up-1">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all" />
      </div>

      <Card padding={false} className="fade-up-2 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['User', 'Role', 'Status', 'Last login', can(role, 'users:update') ? '' : null]
                .filter(Boolean)
                .map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--text-3)] uppercase tracking-widest">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate">{u.name || '—'}</p>
                      <p className="text-xs text-[var(--text-3)] truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={ROLE_VARIANT[u.role] || 'default'}>
                    <Shield size={9} />{u.role.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {u.status === 'ACTIVE'
                      ? <UserCheck size={9} />
                      : <UserX size={9} />}
                    {u.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-xs font-mono text-[var(--text-3)]">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '—'}
                </td>
                {can(role, 'users:update') && (
                  <td className="px-5 py-3.5">
                    {u.id !== user?.id && (
                      <button onClick={() => toggleStatus(u.id, u.status)}
                        className="text-xs text-[var(--text-3)] border border-[var(--border)] px-2.5 py-1 rounded-lg hover:border-[var(--border-strong)] hover:text-[var(--text-2)] transition-all">
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 bg-[var(--text)]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold mb-4">Create user</h2>
            <form onSubmit={createUser} className="space-y-3">
              {[
                { key: 'email', type: 'email', placeholder: 'Email address *', required: true },
                { key: 'name',  type: 'text',  placeholder: 'Full name',       required: false },
              ].map(f => (
                <input key={f.key} type={f.type} required={f.required} placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
              ))}
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors">
                {['VIEWER','USER','MANAGER','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Temporary password"
                className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text-2)] rounded-xl text-sm hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={13} className="animate-spin" />}Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
