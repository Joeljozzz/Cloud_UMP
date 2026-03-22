import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity, Shield, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'
import Card from '../components/ui/Card'
import Stat from '../components/ui/Stat'

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function Analytics() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (can(user?.role || '', 'analytics:read')) {
      api.get('/analytics/overview').then(r => setData(r.data))
    }
  }, [])

  if (!can(user?.role || '', 'analytics:read'))
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-[var(--text-3)]">Insufficient permissions to view analytics.</p>
      </div>
    )

  if (!data)
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-4 w-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    )

  const ACCENT_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

  return (
    <div className="space-y-6">
      <div className="fade-up">
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">Platform usage and audit overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total users"   value={data.total_users} />
        <Stat label="Active users"  value={data.active_users} sub={`${Math.round(data.active_users/Math.max(data.total_users,1)*100)}% of total`} />
        <Stat label="Active agents" value={data.active_agents} />
        <Stat label="Audit events"  value={data.total_audit_events} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-5 flex items-center gap-2">
            <TrendingUp size={12} /> Users by role
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.role_breakdown} barSize={28} barCategoryGap="30%">
              <XAxis dataKey="role" tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'DM Mono' }}
                tickFormatter={v => v.replace('_', ' ').slice(0, 8)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} allowDecimals={false}
                axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'DM Sans' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 500 }}
                itemStyle={{ color: 'var(--text-2)' }}
                cursor={{ fill: 'var(--bg-hover)' }}
              />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.role_breakdown.map((_: any, i: number) => (
                  <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield size={12} /> Audit log
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] pulse-dot ml-auto" />
          </h2>
          <div className="space-y-0 divide-y divide-[var(--border)] max-h-44 overflow-y-auto">
            {data.recent_audit.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2.5 py-2.5 text-xs">
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.success ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                <span className="text-[var(--text)] font-medium flex-1 truncate">
                  {a.action.replace(/_/g, ' ').toLowerCase()}
                </span>
                <span className="font-mono text-[var(--text-3)] flex-shrink-0">
                  {a.user_email?.split('@')[0] || 'system'}
                </span>
                <span className="text-[var(--text-3)] flex-shrink-0 hidden sm:block">
                  {timeAgo(a.created_at)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
