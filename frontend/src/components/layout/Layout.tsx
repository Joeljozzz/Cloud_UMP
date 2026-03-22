import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, Users, Bot, MessageSquare, BarChart3, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useAuthStore, can } from '../../lib/store'
import ThemeToggle from '../ui/ThemeToggle'

const NAV = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', perm: null },
  { to: '/app/users',     icon: Users,           label: 'Users',     perm: 'users:read' },
  { to: '/app/agents',    icon: Bot,             label: 'Agents',    perm: 'agents:read' },
  { to: '/app/chat',      icon: MessageSquare,   label: 'Chat',      perm: 'agents:use' },
  { to: '/app/analytics', icon: BarChart3,       label: 'Analytics', perm: 'analytics:read' },
  { to: '/app/profile',   icon: User,            label: 'Profile',   perm: null },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role || ''

  const visible = NAV.filter(n => n.perm === null || can(role, n.perm))

  function doLogout() { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-52 flex flex-col bg-[var(--bg-card)] border-r border-[var(--border)] flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Shield size={13} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight leading-none truncate">Cloud UMP</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5 truncate">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {visible.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}>
              <Icon size={14} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5">
            <p className="text-xs text-[var(--text-3)] truncate">{user?.email}</p>
            <ThemeToggle className="flex-shrink-0 ml-1" />
          </div>
          <button onClick={doLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-3)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
