import { useEffect, useState, useRef } from 'react'
import { Bot, User, Send, Loader2, AlertTriangle, Zap } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../lib/store'

interface Msg { role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const { user } = useAuthStore()
  const [agents, setAgents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/agents/my').then(r => {
      setAgents(r.data)
      if (r.data.length > 0) setSelected(r.data[0])
    })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selected || loading) return
    const userMsg: Msg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next); setInput(''); setLoading(true); setError('')

    try {
      const { data } = await api.post('/chat', { agent_id: selected.id, messages: next })
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Something went wrong'
      setError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }])
    }
    setLoading(false)
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-4 max-w-6xl">
      {/* Agent picker */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <p className="text-xs font-medium text-gray-500 px-1">Your agents</p>
        {agents.length === 0 && (
          <p className="text-xs text-gray-600 px-1">No agents available. Contact your admin.</p>
        )}
        {agents.map(a => (
          <button key={a.id} onClick={() => { setSelected(a); setMessages([]) }}
            className={`text-left p-3 rounded-xl border text-sm transition-all ${selected?.id === a.id
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
              : 'bg-[#161b27] border-[#1e2535] text-gray-400 hover:border-[#2a3245]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Bot size={13} className="flex-shrink-0" />
              <span className="font-medium truncate">{a.name}</span>
            </div>
            {a.description && <p className="text-xs text-gray-500 line-clamp-2">{a.description}</p>}
          </button>
        ))}

        {selected && (
          <div className="mt-2 p-3 bg-red-900/10 border border-red-800/20 rounded-xl">
            <p className="text-xs text-red-400 font-medium mb-1">🛡️ Active guardrails</p>
            <p className="text-xs text-gray-500">Constitutional layer enforced. Agent cannot take irreversible actions without your confirmation.</p>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-[#161b27] border border-[#1e2535] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2535] flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{selected?.name || 'Select an agent'}</p>
            <p className="text-xs text-gray-500">Free · HuggingFace Zephyr-7B · Constitutional guardrails active</p>
          </div>
          {selected && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg">
              <Zap size={11} />Free inference
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && selected && (
            <div className="text-center py-12">
              <Bot size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Start a conversation with {selected.name}</p>
              <p className="text-xs text-gray-600 mt-1">This agent has constitutional guardrails. Try asking it to delete something — it'll ask you to confirm first.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-600/30' : 'bg-purple-500/10 border border-purple-500/20'}`}>
                {msg.role === 'user' ? <User size={13} className="text-blue-400" /> : <Bot size={13} className="text-purple-400" />}
              </div>
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-[#0f1117] border border-[#1e2535] text-gray-200 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Bot size={13} className="text-purple-400" />
              </div>
              <div className="px-4 py-3 bg-[#0f1117] border border-[#1e2535] rounded-2xl rounded-tl-sm">
                <Loader2 size={14} className="animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1e2535]">
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/30 rounded-lg px-3 py-2 mb-3">
              <AlertTriangle size={13} />{error}
            </div>
          )}
          <form onSubmit={send} className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} disabled={loading || !selected}
              placeholder={selected ? `Message ${selected.name}... (try asking it to delete something)` : 'Select an agent above'}
              className="flex-1 px-4 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-40" />
            <button type="submit" disabled={loading || !input.trim() || !selected}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors">
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
