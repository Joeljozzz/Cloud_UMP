import { useEffect, useState } from 'react'
import { Search, Plus, UserCheck, UserX, Shield, Loader2, ChevronDown } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ADMIN:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MANAGER:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  USER:        'bg-green-500/10 text-green-400 border-green-500/20',
  VIEWER:      'bg-gray-500/10 text-gray-400 border-gray-500/20',
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
    const { data } = await api.get(`/users?search=${search}&limit=50`)
    setUsers(data.users)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await api.post('/users', form)
    await loadUsers()
    setShowCreate(false)
    setForm({ email: '', name: '', role: 'VIEWER', password: 'changeme123' })
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await api.patch(`/users/${id}`, { status })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          <p className="text-gray-400 text-sm">{users.length} total</p>
        </div>
        {can(role, 'users:create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />Add user
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#161b27] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
      </div>

      <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2535] bg-[#0f1117]/50">
              {['User', 'Role', 'Status', 'Last login'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
              {can(role, 'users:update') && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[#1e2535]/50 last:border-0 hover:bg-[#1e2535]/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#1e2535] flex items-center justify-center text-xs font-bold text-gray-300">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{u.name || '—'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.VIEWER}`}>
                    <Shield size={10} />{u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    {u.status === 'ACTIVE'
                      ? <><UserCheck size={13} className="text-green-400" /><span className="text-green-400">Active</span></>
                      : <><UserX size={13} className="text-red-400" /><span className="text-red-400">{u.status}</span></>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                </td>
                {can(role, 'users:update') && (
                  <td className="px-5 py-3.5">
                    {u.id !== user?.id && (
                      <button onClick={() => updateStatus(u.id, u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className="text-xs text-gray-500 hover:text-gray-300 border border-[#1e2535] hover:border-[#2a3245] px-2.5 py-1 rounded-lg transition-colors">
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-white mb-4">Create user</h2>
            <form onSubmit={createUser} className="space-y-3">
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} required type="email" placeholder="Email *"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500">
                {['VIEWER','USER','MANAGER','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Temp password" type="password"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 border border-[#1e2535] text-gray-400 rounded-xl text-sm hover:bg-[#1e2535] transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
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
