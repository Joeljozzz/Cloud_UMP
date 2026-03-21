import { useEffect, useState } from 'react'
import { Bot, Plus, Zap, BookOpen, Loader2, ChevronDown, ChevronUp, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore, can } from '../lib/store'

const CATEGORIES = ['behavior', 'restriction', 'preference', 'knowledge']
const CAT_COLORS: Record<string, string> = {
  behavior: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  restriction: 'bg-red-500/10 text-red-400 border-red-500/20',
  preference: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  knowledge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
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

  const canCreate = can(role, 'agents:create')
  const canManageSkills = can(role, 'agents:manage_skills')

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Agents</h1>
          <p className="text-gray-400 text-sm mt-0.5">Configure AI agents with skills and access controls</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />New agent
          </button>
        )}
      </div>

      {/* Constitutional notice */}
      <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-4 text-sm">
        <p className="text-red-400 font-medium mb-1">🛡️ Constitutional layer is always active</p>
        <p className="text-gray-400">All agents inherit immutable guardrails: confirm before destructive actions, scope boundaries, no impersonation, full audit trail. These cannot be overridden by skills or system prompts.</p>
      </div>

      {/* Agents list */}
      <div className="space-y-3">
        {agents.map(agent => (
          <div key={agent.id} className="bg-[#161b27] border border-[#1e2535] rounded-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white">{agent.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${agent.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {agent.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#1e2535] text-gray-400 border border-[#2a3245]">
                    {agent.model?.split('/').pop()}
                  </span>
                </div>
                {agent.description && <p className="text-sm text-gray-400 mt-1">{agent.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Max tokens: {agent.max_tokens}</span>
                  <span>Temp: {agent.temperature}</span>
                  {agent.allowed_tools?.length > 0 && <span>Tools: {agent.allowed_tools.join(', ')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {agent.status !== 'ACTIVE' && canCreate && (
                  <button onClick={() => activateAgent(agent.id)}
                    className="px-3 py-1.5 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors">
                    Activate
                  </button>
                )}
                <button onClick={() => toggleExpand(agent.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                  {expanded === agent.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Skills panel */}
            {expanded === agent.id && (
              <div className="border-t border-[#1e2535] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-500" />Persistent skills
                    <span className="text-xs text-gray-500">(survive across all conversations)</span>
                  </h4>
                  {canManageSkills && (
                    <button onClick={() => setShowSkillForm(showSkillForm === agent.id ? null : agent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1e2535] hover:bg-[#2a3245] text-gray-300 rounded-lg transition-colors">
                      <Plus size={12} />Add skill
                    </button>
                  )}
                </div>

                {loadingSkills === agent.id && <div className="text-gray-500 text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Loading...</div>}

                {(skills[agent.id] || []).length === 0 && loadingSkills !== agent.id && (
                  <p className="text-sm text-gray-600 italic">No skills yet. Add persistent rules this agent will always follow.</p>
                )}

                <div className="space-y-2 mb-3">
                  {(skills[agent.id] || []).map(skill => (
                    <div key={skill.id} className="flex items-start gap-3 p-3 bg-[#0f1117] rounded-xl border border-[#1e2535]">
                      <span className={`px-2 py-0.5 rounded-md text-xs border flex-shrink-0 ${CAT_COLORS[skill.category] || CAT_COLORS.behavior}`}>
                        {skill.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300">{skill.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{skill.instruction}</p>
                      </div>
                      {canManageSkills && (
                        <button onClick={() => deleteSkill(agent.id, skill.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add skill form */}
                {showSkillForm === agent.id && (
                  <form onSubmit={e => addSkill(agent.id, e)} className="space-y-3 p-4 bg-[#0f1117] rounded-xl border border-[#1e2535]">
                    <p className="text-xs font-medium text-gray-400">New persistent skill</p>
                    <input value={skillForm.title} onChange={e => setSkillForm({...skillForm, title: e.target.value})} required
                      placeholder="Skill title (e.g. Confirm before deleting emails)"
                      className="w-full px-3 py-2 bg-[#161b27] border border-[#1e2535] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                    <textarea value={skillForm.instruction} onChange={e => setSkillForm({...skillForm, instruction: e.target.value})} required rows={3}
                      placeholder="Write the full instruction the agent will always follow..."
                      className="w-full px-3 py-2 bg-[#161b27] border border-[#1e2535] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
                    <div className="flex items-center gap-3">
                      <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})}
                        className="px-3 py-2 bg-[#161b27] border border-[#1e2535] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button type="submit" disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                        {saving && <Loader2 size={13} className="animate-spin" />}Add skill
                      </button>
                    </div>
                  </form>
                )}

                {/* System prompt preview */}
                <details className="mt-3">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 select-none">View agent system prompt</summary>
                  <pre className="mt-2 p-3 bg-[#0f1117] rounded-xl text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap border border-[#1e2535]">{agent.system_prompt}</pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#161b27] border border-[#1e2535] rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-white mb-4">Create new agent</h2>
            <form onSubmit={createAgent} className="space-y-3">
              <input value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} required placeholder="Agent name"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              <input value={agentForm.description} onChange={e => setAgentForm({...agentForm, description: e.target.value})} placeholder="Short description"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              <textarea value={agentForm.system_prompt} onChange={e => setAgentForm({...agentForm, system_prompt: e.target.value})} required rows={4}
                placeholder="System prompt — what can this agent do? (constitutional guardrails always apply on top)"
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max tokens</label>
                  <input type="number" value={agentForm.max_tokens} onChange={e => setAgentForm({...agentForm, max_tokens: +e.target.value})}
                    min={50} max={500}
                    className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Temperature</label>
                  <input type="number" value={agentForm.temperature} onChange={e => setAgentForm({...agentForm, temperature: +e.target.value})}
                    min={0} max={1} step={0.1}
                    className="w-full px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <p className="text-xs text-gray-600">Model: {agentForm.model} (free HuggingFace inference)</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 border border-[#1e2535] text-gray-400 rounded-xl text-sm hover:bg-[#1e2535] transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
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
