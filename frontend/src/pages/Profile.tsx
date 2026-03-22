import { useState } from 'react'
import { useAuthStore } from '../lib/store'
import { User, Mail, Shield, Clock, Github, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const ROLE_INFO: Record<string, { label: string; description: string; variant: any }> = {
  SUPER_ADMIN: { label: 'Super Admin',  description: 'Full platform access including role management.',       variant: 'accent' },
  ADMIN:       { label: 'Admin',        description: 'Can manage users, agents, skills and view analytics.',  variant: 'accent' },
  MANAGER:     { label: 'Manager',      description: 'Can view analytics and use agents.',                    variant: 'warning' },
  USER:        { label: 'User',         description: 'Can use assigned AI agents via the chat interface.',    variant: 'success' },
  VIEWER:      { label: 'Viewer',       description: 'Read-only access to permitted areas.',                  variant: 'default' },
}

export default function Profile() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const roleInfo = ROLE_INFO[user?.role || 'VIEWER']

  function copyId() {
    navigator.clipboard.writeText(user?.id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="fade-up">
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">Your account details and permissions</p>
      </div>

      {/* Identity card */}
      <Card className="fade-up-1">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0 text-xl font-semibold" style={{ color: 'var(--accent)' }}>
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{user?.name || 'No name set'}</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-[var(--text-2)]">
              <Mail size={12} />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="mt-2">
              <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Role details */}
      <Card className="fade-up-2">
        <h2 className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-4">Access level</h2>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
            <Shield size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-medium">{roleInfo.label}</p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">{roleInfo.description}</p>
          </div>
        </div>
      </Card>

      {/* Account info */}
      <Card className="fade-up-3">
        <h2 className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-4">Account details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-xs text-[var(--text-3)]">User ID</span>
            <button onClick={copyId} className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-2)] hover:text-[var(--text)] transition-colors">
              {copied ? <Check size={11} className="text-[var(--success)]" /> : null}
              {user?.id?.slice(0, 8)}...
            </button>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-xs text-[var(--text-3)]">Status</span>
            <Badge variant="success">{user?.status || 'Active'}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[var(--text-3)]">Platform</span>
            <span className="text-xs text-[var(--text-2)]">Cloud UMP v1.0</span>
          </div>
        </div>
      </Card>

      {/* Built by */}
      <Card className="fade-up-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-2)]">Cloud UMP</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Designed and built by Joel Jose · Mumbai</p>
          </div>
          <a href="https://github.com/Joeljozzz" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
            <Github size={13} /> @Joeljozzz
          </a>
        </div>
      </Card>
    </div>
  )
}
