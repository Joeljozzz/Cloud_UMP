import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import About from './pages/About'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Agents from './pages/Agents'
import Chat from './pages/Chat'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<About />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/app"    element={<Protected><Layout /></Protected>}>
          <Route index                element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="users"         element={<Users />} />
          <Route path="agents"        element={<Agents />} />
          <Route path="chat"          element={<Chat />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="profile"       element={<Profile />} />
        </Route>
        {/* redirect old paths */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/chat"      element={<Navigate to="/app/chat" replace />} />
        <Route path="/users"     element={<Navigate to="/app/users" replace />} />
        <Route path="/agents"    element={<Navigate to="/app/agents" replace />} />
        <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
        <Route path="/profile"   element={<Navigate to="/app/profile" replace />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
