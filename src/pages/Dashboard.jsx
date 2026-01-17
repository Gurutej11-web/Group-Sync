import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUserProjects, createProject, inviteMemberByEmail } from '../utils/firestore'
import toast from 'react-hot-toast'

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    const unsub = listUserProjects(user.uid, setProjects)
    return () => unsub && unsub()
  }, [user.uid])

  const handleCreate = async () => {
    if (!title.trim()) return
    setCreating(true)
    try {
      await createProject({
        title,
        description,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        members: [user.uid],
        roles: { [user.uid]: 'Leader' },
      }, user)
      setTitle('')
      setDescription('')
      toast.success('Project created')
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async (projectId) => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await inviteMemberByEmail(projectId, inviteEmail.trim(), 'Contributor')
      toast.success('Member invited')
      setInviteEmail('')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card p-4 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/project/${p.id}`} className="font-semibold text-primary-700 hover:underline">{p.title}</Link>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{(p.progress ?? 0)}%</span>
                  <div className="text-xs text-gray-600">Code: {p.inviteCode || '-'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="text-sm text-gray-600">Members: {p.members.length}</div>
                <input className="input" placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <button className="btn-secondary" onClick={() => handleInvite(p.id)} disabled={inviting}>Invite</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-sm text-gray-600">No projects yet — create one below.</div>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-2">Create Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="History Group Project" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Final presentation" />
          </div>
        </div>
        <button className="btn-primary mt-3" onClick={handleCreate} disabled={creating}>Create</button>
      </div>

      <div className="text-sm text-gray-700">Have a code? <Link to="/join" className="text-primary-700">Join a project</Link></div>
    </div>
  )
}
