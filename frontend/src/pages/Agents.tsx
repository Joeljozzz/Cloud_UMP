import { useEffect, useState } from 'react'
import { Bot, Plus, BookOpen, Loader2, ChevronDown, ChevronUp, Trash2, Zap } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const CAT_VARIANT: Record<string, any> = {
  behavior:    'accent',
  restriction: 'danger',
  preference:  'warning',
  knowledge:   'success',
}

export default function Agents() {
  const { user } = useAuthStore()
  const role = user?.role || ''
  const [agents, setAgents] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [skills, setSkills] = useState<Record<string, any[]>>({})
  const [loadingSkills, setLoadingSkills] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showSkillForm, setShowSkillForm] = useState<string | null>(null)
  const [skillForm, setSkillForm] = useState({ title: '', instruction: '', category: 'behavior' })
  const [agentForm, setAgentForm] = useState({ name: '', description: '', system_prompt: '', model: 'HuggingFaceH4/zephyr-7b-beta', max_tokens: 400, temperature: 0.7 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAgents() }, [])

  async function loadAgents() {
    const { data } = await api.get('/agents')
    setAgents(data)
  }

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!skills[id]) {
      setLoadingSkills(id)
      const { data } = await api.get(`/agents/${id}/skills`)
      setSkills(prev => ({ ...prev, [id]: data }))
      setLoadingSkills(null)
    }
  }

  async function activateAgent(id: string) {
    await api.patch(`/agents/${id}`, { status: 'ACTIVE' })
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'ACTIVE' } : a))
  }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data } = await api.post('/agents', agentForm)
    setAgents(prev => [data, ...prev])
    setShowCreate(false)
    setAgentForm({ name: '', description: '', system_prompt: '', model: 'HuggingFaceH4/zephyr-7b-beta', max_tokens: 400, temperature: 0.7 })
    setSaving(false)
  }

  async function addSkill(agentId: string, e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data } = await api.post(`/agents/${agentId}/skills`, skillForm)
    setSkills(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), data] }))
    setSkillForm({ title: '', instruction: '', category: 'behavior' })
    setShowSkillForm(null); setSaving(false)
  }

  async function deleteSkill(agentId: string, skillId: string) {
    await api.delete(`/agents/${agentId}/skills/${skillId}`)
    setSkills(prev => ({ ...prev, [agentId]: prev[agentId].filter(s => s.id !== skillId) }))
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">Configure AI agents with persistent skill rules</p>
        </div>
        {can(role, 'agents:create') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={14} />New agent
          </button>
        )}
      </div>

      {/* Constitutional notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-xl fade-up-1">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--danger)] mt-1.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-[var(--danger)] mb-0.5">Constitutional layer always active</p>
          <p className="text-xs text-[var(--text-2)]">All agents inherit immutable guardrails. No skill or system prompt can remove them.</p>
        </div>
      </div>

      {/* Agent list */}
      <div className="space-y-3">
        {agents.map((agent, idx) => (
          <div key={agent.id} className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden fade-up-${Math.min(idx + 2, 5)}`}>
            <div className="p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Bot size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm">{agent.name}</h3>
                  <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'default'}>{agent.status}</Badge>
                  <Badge variant="outline">
                    <Zap size={9} />{agent.model?.split('/').pop()?.slice(0,10)}
                  </Badge>
                </div>
                {agent.description && <p className="text-xs text-[var(--text-2)] mt-1">{agent.description}</p>}
                <div className="flex gap-3 mt-1.5 text-xs font-mono text-[var(--text-3)]">
                  <span>{agent.max_tokens} tokens</span>
                  <span>t={agent.temperature}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {agent.status !== 'ACTIVE' && can(role, 'agents:create') && (
                  <button onClick={() => activateAgent(agent.id)}
                    className="px-3 py-1.5 text-xs bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/20 rounded-lg hover:opacity-80 transition-opacity">
                    Activate
                  </button>
                )}
                <button onClick={() => toggleExpand(agent.id)}
                  className="p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]">
                  {expanded === agent.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {expanded === agent.id && (
              <div className="border-t border-[var(--border)] p-5 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-medium text-[var(--text-2)] uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={11} />Persistent skills
                  </h4>
                  {can(role, 'agents:manage_skills') && (
                    <button onClick={() => setShowSkillForm(showSkillForm === agent.id ? null : agent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-2)] rounded-lg hover:border-[var(--border-strong)] transition-colors">
                      <Plus size={11} />Add skill
                    </button>
                  )}
                </div>

                {loadingSkills === agent.id && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                    <Loader2 size={12} className="animate-spin" />Loading...
                  </div>
                )}

                {(skills[agent.id] || []).length === 0 && loadingSkills !== agent.id && (
                  <p className="text-xs text-[var(--text-3)] italic">No skills yet. Skills are persistent rules the agent always follows.</p>
                )}

                <div className="space-y-2 mb-3">
                  {(skills[agent.id] || []).map(skill => (
                    <div key={skill.id} className="flex items-start gap-3 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
                      <Badge variant={CAT_VARIANT[skill.category] || 'default'} size="sm">{skill.category}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text)]">{skill.title}</p>
                        <p className="text-xs text-[var(--text-3)] mt-0.5 line-clamp-2">{skill.instruction}</p>
                      </div>
                      {can(role, 'agents:manage_skills') && (
                        <button onClick={() => deleteSkill(agent.id, skill.id)}
                          className="text-[var(--text-3)] hover:text-[var(--danger)] transition-colors flex-shrink-0">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {showSkillForm === agent.id && (
                  <form onSubmit={e => addSkill(agent.id, e)} className="space-y-2.5 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest">New skill</p>
                    <input value={skillForm.title} onChange={e => setSkillForm({...skillForm, title: e.target.value})} required
                      placeholder="Skill title"
                      className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
                    <textarea value={skillForm.instruction} onChange={e => setSkillForm({...skillForm, instruction: e.target.value})} required rows={3}
                      placeholder="Write the full instruction..."
                      className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" />
                    <div className="flex gap-2">
                      <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})}
                        className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors">
                        {['behavior','restriction','preference','knowledge'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button type="submit" disabled={saving}
                        className="flex-1 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <Loader2 size={12} className="animate-spin" />}Add
                      </button>
                    </div>
                  </form>
                )}

                <details className="mt-3">
                  <summary className="text-xs text-[var(--text-3)] cursor-pointer hover:text-[var(--text-2)] select-none transition-colors">View system prompt</summary>
                  <pre className="mt-2 p-3 bg-[var(--bg-card)] rounded-xl text-xs font-mono text-[var(--text-2)] overflow-x-auto whitespace-pre-wrap border border-[var(--border)]">{agent.system_prompt}</pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create agent modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-[var(--text)]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold mb-1">New agent</h2>
            <p className="text-xs text-[var(--text-3)] mb-5">Constitutional guardrails always apply on top of this configuration.</p>
            <form onSubmit={createAgent} className="space-y-3">
              <input value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} required
                placeholder="Agent name"
                className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
              <input value={agentForm.description} onChange={e => setAgentForm({...agentForm, description: e.target.value})}
                placeholder="Short description"
                className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
              <textarea value={agentForm.system_prompt} onChange={e => setAgentForm({...agentForm, system_prompt: e.target.value})} required rows={4}
                placeholder="System prompt — what is this agent's purpose and capability?"
                className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-3)] mb-1 block">Max tokens (50–500)</label>
                  <input type="number" value={agentForm.max_tokens} onChange={e => setAgentForm({...agentForm, max_tokens: +e.target.value})} min={50} max={500}
                    className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-3)] mb-1 block">Temperature (0–1)</label>
                  <input type="number" value={agentForm.temperature} onChange={e => setAgentForm({...agentForm, temperature: +e.target.value})} min={0} max={1} step={0.1}
                    className="w-full px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text-2)] rounded-xl text-sm hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={13} className="animate-spin" />}Create agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
