import { create } from 'zustand'

interface User { id: string; email: string; name: string | null; role: string; status: string }
interface AuthStore {
  user: User | null; token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  }
}))

const PERMS: Record<string, string[]> = {
  SUPER_ADMIN: ['users:read','users:create','users:update','users:delete','agents:read','agents:use','agents:create','agents:update','agents:delete','agents:manage_skills','agents:manage_access','analytics:read','audit:read'],
  ADMIN:       ['users:read','users:create','users:update','users:delete','agents:read','agents:use','agents:create','agents:update','agents:manage_skills','agents:manage_access','analytics:read','audit:read'],
  MANAGER:     ['users:read','agents:read','agents:use','analytics:read'],
  USER:        ['agents:read','agents:use'],
  VIEWER:      [],
}
export const can = (role: string, perm: string) => PERMS[role]?.includes(perm) ?? false
