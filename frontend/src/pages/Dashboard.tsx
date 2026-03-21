import { useEffect, useState } from 'react'
import { Users, Bot, MessageSquare, Activity, Shield, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'

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
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name || user?.email}</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total users', value: stats.total_users, icon: Users, color: 'text-blue-400' },
              { label: 'Active users', value: stats.active_users, icon: Activity, color: 'text-green-400' },
              { label: 'Active agents', value: stats.active_agents, icon: Bot, color: 'text-purple-400' },
              { label: 'Chat sessions', value: stats.total_chats, icon: MessageSquare, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Role breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
              <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Shield size={14} className="text-gray-500" />Role breakdown
              </h2>
              <div className="space-y-2">
                {stats.role_breakdown.map((r: any) => (
                  <div key={r.role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{r.role.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-white">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-5">
              <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-gray-500" />Recent activity
              </h2>
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {stats.recent_audit.slice(0, 8).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${a.success ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-xs text-gray-400 truncate flex-1">{a.action.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-600">{a.user_email?.split('@')[0] || 'system'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!can(role, 'analytics:read') && (
        <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-10 text-center">
          <TrendingUp size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Use the sidebar to navigate to your available features.</p>
        </div>
      )}
    </div>
  )
}
