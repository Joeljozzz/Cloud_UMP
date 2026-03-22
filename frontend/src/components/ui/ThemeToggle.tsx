import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setDark(saved === 'dark')
  }, [])

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-2)] hover:text-[var(--text)] ${className}`}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
