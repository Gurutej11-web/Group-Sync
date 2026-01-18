import { useEffect, useState } from 'react'
import { listShoutouts, addShoutout, listMoods, setMoodStatus, getUsersByIds, cheerShoutout, listUserProjects, updateShoutout, deleteShoutout, deleteMood } from '../utils/firestore'
import toast from 'react-hot-toast'

export default function InteractionHub({ user }) {
  const [shoutouts, setShoutouts] = useState([])
  const [moods, setMoods] = useState([])
  const [message, setMessage] = useState('')
  const [toUser, setToUser] = useState('')
  const [toName, setToName] = useState('Team')
  const [mood, setMood] = useState('Energized')
  const [note, setNote] = useState('')
  const [members, setMembers] = useState([])
  const [sendingShout, setSendingShout] = useState(false)
  const [sendingMood, setSendingMood] = useState(false)
  const [cheeringId, setCheeringId] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [editingShoutout, setEditingShoutout] = useState(null)
  const [editShoutMessage, setEditShoutMessage] = useState('')

  // Load user's projects and then subscribe to shoutouts/moods per project
  useEffect(() => {
    const unsubProjects = listUserProjects(user.uid, (rows) => {
      setProjects(rows)
      if (!projectId && rows.length) setProjectId(rows[0].id)
    })
    return () => { unsubProjects && unsubProjects() }
  }, [user.uid, projectId])

  useEffect(() => {
    if (!projectId) return () => {}
    const unsubS = listShoutouts(projectId, setShoutouts)
    const unsubM = listMoods(projectId, setMoods)
    return () => { unsubS && unsubS(); unsubM && unsubM() }
  }, [projectId])

  // Load teammate names for shoutout dropdown
  useEffect(() => {
    async function loadMembers() {
      const ids = Array.from(new Set(moods.map((m) => m.user).concat(user.uid).concat(projects.flatMap(p => p.members || []))))
      const users = await getUsersByIds(ids)
      setMembers(users)
    }
    loadMembers().catch(() => setMembers([]))
  }, [moods, user.uid, projects])

  const moodPalette = {
    Energized: 'from-emerald-400 to-lime-300',
    Focused: 'from-sky-400 to-blue-500',
    Stretched: 'from-amber-400 to-orange-500',
    Tired: 'from-rose-400 to-pink-500',
  }

  const handleShoutout = async () => {
    if (!message.trim()) {
      toast.error('Add a message first')
      return
    }
    if (!projectId) {
      toast.error('Select a project')
      return
    }
    setSendingShout(true)
    try {
      await addShoutout({ message: message.trim(), toUser: toUser || null, toName: (toName || members.find(m => m.id === toUser)?.name || 'Team'), projectId }, user)
      setMessage('')
      setToUser('')
      setToName('Team')
      toast.success('Shoutout sent!')
    } catch (e) {
      toast.error(e.message || 'Could not send shoutout')
    } finally {
      setSendingShout(false)
    }
  }

  const handleMood = async () => {
    if (!projectId) {
      toast.error('Select a project')
      return
    }
    setSendingMood(true)
    try {
      await setMoodStatus(user, mood, note, projectId)
      toast.success('Mood updated')
    } catch (e) {
      toast.error(e.message || 'Could not update mood')
    } finally {
      setSendingMood(false)
    }
  }

  const startEditShoutout = (s) => {
    setEditingShoutout(s)
    setEditShoutMessage(s.message)
  }

  const handleSaveShoutout = async () => {
    if (!editingShoutout) return
    if (!editShoutMessage.trim()) {
      toast.error('Message required')
      return
    }
    try {
      await updateShoutout(editingShoutout.id, { message: editShoutMessage.trim(), toName: editingShoutout.toName || 'Team' })
      toast.success('Shoutout updated')
      setEditingShoutout(null)
      setEditShoutMessage('')
    } catch (e) {
      toast.error('Could not update shoutout')
    }
  }

  const handleDeleteShoutout = async (id) => {
    const ok = window.confirm('Delete this shoutout?')
    if (!ok) return
    try {
      await deleteShoutout(id)
      toast.success('Shoutout deleted')
    } catch (e) {
      toast.error('Could not delete shoutout')
    }
  }

  const handleDeleteMood = async () => {
    if (!projectId) return
    try {
      await deleteMood(projectId, user.uid)
      toast.success('Mood removed')
    } catch (e) {
      toast.error('Could not delete mood')
    }
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div className="card cinematic-panel p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Team Pulse</p>
          <h1 className="text-2xl font-bold text-slate-900">Shoutouts & Moodboard</h1>
          <p className="text-slate-600 text-sm">Celebrate wins, share how you feel, and keep the crew connected.</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-md flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          🌐 Real-time • Connected
        </div>
      </div>

      <div className="card cinematic-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Select project</span>
          <span className="text-xs text-slate-500">Shoutouts and moods are per project</span>
        </div>
        <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Choose a project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card cinematic-panel p-4 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Send a Shoutout</h2>
            <span className="text-xs text-slate-500">Lift someone up today</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <select className="input" value={toUser} onChange={(e) => setToUser(e.target.value)}>
              <option value="">To: Everyone</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name || m.email || 'Teammate'}</option>
              ))}
            </select>
            <input className="input" placeholder="Optional name" value={toName} onChange={(e) => setToName(e.target.value)} />
          </div>
          <button className="btn-primary px-4 py-2 disabled:opacity-50" onClick={handleShoutout} disabled={sendingShout}>{sendingShout ? 'Sending…' : 'Send'}</button>
          <div className="soft-divider" aria-hidden></div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {shoutouts.map(s => (
              <div key={s.id} className="rounded-lg border border-[color:var(--gs-border)] bg-white p-3 flex gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {(s.fromName || 'U')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{s.fromName || 'Someone'}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-800">{s.toName || 'Team'}</span>
                    <span className="text-[11px] text-slate-500 ml-auto">{s.timestamp?.toDate?.() ? s.timestamp.toDate().toLocaleString() : ''}</span>
                  </div>
                  {editingShoutout?.id === s.id ? (
                    <div className="space-y-2">
                      <input className="input" value={editShoutMessage} onChange={(e) => setEditShoutMessage(e.target.value)} />
                      <div className="flex gap-2 text-xs">
                        <button className="btn-primary px-2 py-1" onClick={handleSaveShoutout}>Save</button>
                        <button className="btn-secondary px-2 py-1" onClick={() => { setEditingShoutout(null); setEditShoutMessage('') }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 text-sm">{s.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <button
                          className="btn-secondary px-2 py-1 text-xs"
                          disabled={cheeringId === s.id}
                          onClick={async () => {
                            setCheeringId(s.id)
                            try { await cheerShoutout(s.id) } finally { setCheeringId(null) }
                          }}
                        >
                          👏 {s.cheers || 0} Cheer{s.cheers === 1 ? '' : 's'}
                        </button>
                        {s.fromUser === user.uid && (
                          <div className="flex gap-2 text-slate-500">
                            <button className="underline" onClick={() => startEditShoutout(s)}>Edit</button>
                            <button className="underline" onClick={() => handleDeleteShoutout(s.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {shoutouts.length === 0 && <div className="text-sm text-slate-500">No shoutouts yet. Start the love!</div>}
          </div>
        </div>

        <div className="card cinematic-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">How are you feeling?</h2>
            <span className="text-xs text-slate-500">Check-in</span>
          </div>
          <select className="input" value={mood} onChange={(e) => setMood(e.target.value)}>
            {Object.keys(moodPalette).map(m => (<option key={m}>{m}</option>))}
          </select>
          <textarea className="input min-h-[80px]" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
          <button className="btn-primary px-4 py-2 disabled:opacity-50" onClick={handleMood} disabled={sendingMood}>{sendingMood ? 'Saving…' : 'Share Mood'}</button>
          <div className="soft-divider" aria-hidden></div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {moods.map(m => (
              <div key={m.id} className="rounded-lg border border-[color:var(--gs-border)] bg-white p-3 flex items-center gap-3 shadow-sm">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${moodPalette[m.mood] || 'from-purple-500 to-pink-500'} flex items-center justify-center text-white font-semibold`}>
                  {(m.name || 'U')[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    <span className="text-slate-600">{m.mood}</span>
                    <span className="text-[11px] text-slate-500 ml-auto">{m.updatedAt?.toDate?.() ? m.updatedAt.toDate().toLocaleString() : ''}</span>
                  </div>
                  {m.note && <p className="text-slate-700 text-sm mt-1">{m.note}</p>}
                  {m.user === user.uid && (
                    <div className="text-xs text-slate-500 mt-1 flex gap-2">
                      <button className="underline" onClick={() => { setMood(m.mood); setNote(m.note || '') }}>Edit</button>
                      <button className="underline" onClick={handleDeleteMood}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {moods.length === 0 && <div className="text-sm text-slate-500">No moods shared yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
