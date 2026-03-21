import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, Users, Bot, MessageSquare, BarChart3, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore, can } from '../../lib/store'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', perm: null },
  { to: '/users',     icon: Users,           label: 'Users',     perm: 'users:read' },
  { to: '/agents',    icon: Bot,             label: 'Agents',    perm: 'agents:read' },
  { to: '/chat',      icon: MessageSquare,   label: 'AI Chat',   perm: 'agents:use' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics', perm: 'analytics:read' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role || ''

  const visible = nav.filter(n => n.perm === null || can(role, n.perm))

  function doLogout() { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col bg-[#161b27] border-r border-[#1e2535]">
        <div className="p-4 border-b border-[#1e2535]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Cloud UMP</p>
              <p className="text-xs text-gray-500 mt-0.5">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {visible.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                  ? 'bg-blue-600/15 text-blue-400 font-medium'
                  : 'text-gray-400 hover:bg-[#1e2535] hover:text-gray-200'}`}>
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-[#1e2535]">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-gray-300 leading-none">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-600 mt-0.5 truncate">{user?.email}</p>
          </div>
          <button onClick={doLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-900/20 hover:text-red-400 transition-all">
            <LogOut size={15} />Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
