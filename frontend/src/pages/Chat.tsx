import { useEffect, useState, useRef } from 'react'
import { Bot, User, Send, Loader2, AlertTriangle, Info } from 'lucide-react'
import api from '../lib/api'
import Badge from '../components/ui/Badge'

interface Msg { role: 'user' | 'assistant'; content: string; ts?: string }

export default function Chat() {
  const [agents, setAgents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    api.get('/agents/my').then(r => {
      setAgents(r.data)
      if (r.data.length > 0) setSelected(r.data[0])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() || !selected || loading) return
    const userMsg: Msg = { role: 'user', content: input.trim(), ts: new Date().toISOString() }
    const next = [...messages, userMsg]
    setMessages(next); setInput(''); setLoading(true); setError('')

    try {
      const { data } = await api.post('/chat', { agent_id: selected.id, messages: next })
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, ts: new Date().toISOString() }])
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Something went wrong'
      setError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: msg }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-4">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-1.5">
        <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest px-1 mb-1">Agents</p>
        {agents.length === 0 && (
          <p className="text-xs text-[var(--text-3)] px-1">No agents available.</p>
        )}
        {agents.map(a => (
          <button key={a.id} onClick={() => { setSelected(a); setMessages([]) }}
            className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
              selected?.id === a.id
                ? 'bg-[var(--accent-bg)] border-[var(--accent)]/30 text-[var(--accent)]'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
            }`}>
            <div className="flex items-center gap-2 mb-0.5">
              <Bot size={12} className="flex-shrink-0" />
              <span className="font-medium text-xs truncate">{a.name}</span>
            </div>
            {a.description && (
              <p className="text-xs text-[var(--text-3)] line-clamp-2 mt-0.5">{a.description}</p>
            )}
          </button>
        ))}

        {selected && (
          <div className="mt-3 px-3 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
            <p className="text-xs font-medium text-[var(--text-2)] mb-1.5 flex items-center gap-1.5">
              <Info size={11} />Guardrails active
            </p>
            <p className="text-xs text-[var(--text-3)] leading-relaxed">
              Constitutional layer enforced. Irreversible actions require your confirmation.
            </p>
          </div>
        )}
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-3 flex-shrink-0">
          <div className="h-7 w-7 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
            <Bot size={13} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selected?.name || 'Select an agent'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline">HF Zephyr-7B</Badge>
            <Badge variant="success">Free</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && selected && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="h-12 w-12 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                <Bot size={20} className="text-[var(--text-3)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-2)] mb-1">{selected.name}</p>
              <p className="text-xs text-[var(--text-3)] max-w-xs leading-relaxed">
                Try asking it to delete something — watch the constitutional guardrails kick in.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] '
                  : 'bg-[var(--bg-subtle)] border border-[var(--border)]'
              }`}>
                {msg.role === 'user'
                  ? <User size={11} className="text-white" />
                  : <Bot size={11} className="text-[var(--text-2)]" />}
              </div>
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-white rounded-tr-sm'
                  : 'bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={11} className="text-[var(--text-2)]" />
              </div>
              <div className="px-4 py-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--text-3)]"
                      style={{ animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0">
          {error && (
            <div className="flex items-center gap-2 text-xs text-[var(--warning)] bg-[var(--warning-bg)] border border-[var(--warning)]/20 rounded-lg px-3 py-2 mb-2.5">
              <AlertTriangle size={12} />{error}
            </div>
          )}
          <div className="flex gap-2.5 items-end">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || !selected}
              rows={1}
              placeholder={selected ? `Message ${selected.name}  ·  Enter to send` : 'Select an agent'}
              className="flex-1 px-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all disabled:opacity-40 resize-none leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button onClick={send} disabled={loading || !input.trim() || !selected}
              className="h-[42px] w-[42px] flex-shrink-0 flex items-center justify-center bg-[var(--accent)] text-white rounded-xl hover:opacity-90 disabled:opacity-30 transition-all">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-2 text-center">Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
