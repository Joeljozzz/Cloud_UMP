import { useEffect, useState } from 'react'
import { Users, Bot, MessageSquare, Activity, Shield, TrendingUp, Clock } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'
import Stat from '../components/ui/Stat'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const role = user?.role || ''

  useEffect(() => {
    if (can(role, 'analytics:read')) {
      api.get('/analytics/overview').then(r => setStats(r.data)).catch(() => {})
    }
  }, [role])

  return (
    <div className="space-y-6">
      <div className="fade-up">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">
          Good to have you, <span className="text-[var(--text)]">{user?.name || user?.email?.split('@')[0]}</span>
        </p>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Total users"   value={stats.total_users}   sub={`${stats.active_users} active`} />
            <Stat label="Active agents" value={stats.active_agents} sub={`${stats.total_agents} total`} />
            <Stat label="Chat sessions" value={stats.total_chats}   />
            <Stat label="Audit events"  value={stats.total_audit_events} accent />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Role breakdown */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium flex items-center gap-2">
                  <Shield size={13} className="text-[var(--text-3)]" /> Users by role
                </h2>
              </div>
              <div className="space-y-2.5">
                {stats.role_breakdown.map((r: any) => {
                  const pct = stats.total_users > 0 ? Math.round((r.count / stats.total_users) * 100) : 0
                  return (
                    <div key={r.role}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-2)]">{r.role.replace('_', ' ')}</span>
                        <span className="text-xs font-mono text-[var(--text-3)]">{r.count}</span>
                      </div>
                      <div className="h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Activity feed */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium flex items-center gap-2">
                  <Activity size={13} className="text-[var(--text-3)]" /> Recent activity
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] pulse-dot" />
              </div>
              <div className="space-y-0 divide-y divide-[var(--border)]">
                {stats.recent_audit.slice(0, 7).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.success ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                    <span className="text-xs text-[var(--text)] flex-1 truncate">
                      {a.action.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-3)] flex-shrink-0">
                      {a.user_email?.split('@')[0] || 'system'}
                    </span>
                    <span className="text-xs text-[var(--text-3)] flex-shrink-0 hidden sm:block">
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="py-12 text-center">
          <TrendingUp size={32} className="text-[var(--text-3)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-2)]">Use the sidebar to navigate to your available features.</p>
          <p className="text-xs text-[var(--text-3)] mt-1">Your role: <span className="font-mono">{role}</span></p>
        </Card>
      )}
    </div>
  )
}
