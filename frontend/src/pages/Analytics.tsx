import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'

export default function Analytics() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (can(user?.role || '', 'analytics:read')) {
      api.get('/analytics/overview').then(r => setData(r.data))
    }
  }, [])

  if (!can(user?.role || '', 'analytics:read'))
    return <div className="text-gray-500 text-sm p-6">You don't have permission to view analytics.</div>

  if (!data) return <div className="text-gray-500 text-sm p-6">Loading...</div>

  const colors = ['#3b82f6','#8b5cf6','#14b8a6','#f59e0b','#ef4444']

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">Platform usage and audit overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total users', value: data.total_users },
          { label: 'Active agents', value: data.active_agents },
          { label: 'Audit events', value: data.total_audit_events },
        ].map(s => (
          <div key={s.label} className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Role chart */}
        <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-gray-500" />Users by role
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.role_breakdown} barSize={32}>
              <XAxis dataKey="role" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v.replace('_', ' ')} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e5e7eb' }} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.role_breakdown.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent audit */}
        <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-500" />Recent audit log
          </h2>
          <div className="space-y-2.5 max-h-44 overflow-y-auto">
            {data.recent_audit.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2.5 text-xs">
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.success ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-gray-300 font-medium min-w-0 truncate">{a.action.replace(/_/g, ' ')}</span>
                <span className="text-gray-600 ml-auto flex-shrink-0">{a.user_email?.split('@')[0] || 'system'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
