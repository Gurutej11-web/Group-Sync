import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUserProjects, createProject, inviteMemberByEmail, updateProjectMeta, deleteProject } from '../utils/firestore'
import toast from 'react-hot-toast'

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [manageProject, setManageProject] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const unsub = listUserProjects(user.uid, setProjects)
    return () => unsub && unsub()
  }, [user.uid])

  const scrollToCreate = () => {
    const createSection = document.getElementById('create-project-section')
    if (createSection) {
      createSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus on the title input after scrolling
      setTimeout(() => {
        const titleInput = document.querySelector('#create-project-section input')
        if (titleInput) titleInput.focus()
      }, 500)
    }
  }

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

  const openManage = (project) => {
    setManageProject(project)
    setEditTitle(project.title || '')
    setEditDescription(project.description || '')
    setManageOpen(true)
  }

  const handleSaveProject = async () => {
    if (!manageProject || !editTitle.trim()) {
      toast.error('Title required')
      return
    }
    setSaving(true)
    try {
      await updateProjectMeta(manageProject.id, { title: editTitle.trim(), description: editDescription.trim() })
      toast.success('Project updated')
      setManageOpen(false)
    } catch (e) {
      toast.error('Could not update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!manageProject) return
    const confirmDelete = window.confirm('Delete this project and all its tasks, comments, shoutouts, and moods?')
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteProject(manageProject.id)
      toast.success('Project deleted')
      setManageOpen(false)
    } catch (e) {
      toast.error('Could not delete project')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 card cinematic-panel p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-orange-400/10 blur-2xl" aria-hidden></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-purple-700 mb-2">Studio Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900">Welcome back, {user.displayName || 'teammate'}.</h1>
              <p className="text-sm text-slate-600 mt-1">Spin up projects, invite your crew, and keep every scene moving.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/join" className="btn-secondary px-4 py-2">Join with Code</Link>
              <button onClick={scrollToCreate} className="btn-primary px-4 py-2 whitespace-nowrap">
                New Project
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title="Projects"
            value={projects.length}
            accent="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Members"
            value={projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)}
            accent="from-sky-500 to-cyan-400"
          />
          <StatCard
            title="Avg Progress"
            value={`${Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(projects.length, 1))}%`}
            accent="from-emerald-500 to-lime-400"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <Link to="/join" className="text-sm font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Join Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card cinematic-panel p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Create your first project to start collaborating with your team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} className="card cinematic-panel p-6 hover:shadow-fuchsia-500/20 hover:-translate-y-1 transition-all text-slate-900">
                <div className="mb-4 space-y-1">
                  <Link to={`/project/${p.id}`} className="text-lg font-bold hover:text-purple-700 transition-colors">{p.title}</Link>
                  <p className="text-sm text-slate-600 line-clamp-2">{p.description || 'No description'}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-900">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-orange-400 rounded-full transition-all"
                        style={{ width: `${p.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">👥</div>
                      <span>{p.members?.length || 0} members</span>
                    </div>
                    <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">
                      {p.inviteCode || 'No code'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex gap-2">
                    <input 
                      className="flex-1 input text-sm" 
                      placeholder="Email to invite" 
                      value={inviteEmail} 
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleInvite(p.id)}
                    />
                    <button 
                      className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                      onClick={() => handleInvite(p.id)} 
                      disabled={inviting}
                    >
                      Invite
                    </button>
                    {p.createdBy === user.uid && (
                      <button 
                        className="px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50" 
                        onClick={() => openManage(p)}
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="create-project-section" className="card cinematic-panel p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Project Title *</label>
            <input 
              className="input px-4 py-3" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="History Group Project"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input 
              className="input px-4 py-3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Final presentation preparation"
            />
          </div>
        </div>
        <button 
          className="mt-4 px-6 py-3 btn-primary font-semibold hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleCreate} 
          disabled={creating || !title.trim()}
        >
          {creating ? 'Creating...' : '+ Create Project'}
        </button>
      </div>

      {manageOpen && manageProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card bg-white shadow-xl w-full max-w-lg p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-600">Project Settings</p>
                <h3 className="text-lg font-semibold">{manageProject.title}</h3>
              </div>
              <button className="text-slate-500 hover:text-slate-800" onClick={() => setManageOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Title</label>
              <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Description</label>
              <textarea className="input min-h-[80px]" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <button 
                className="px-3 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50" 
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Project'}
              </button>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setManageOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveProject} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, accent }) {
  return (
    <div className="card cinematic-panel p-4 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md shadow-black/30`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}
