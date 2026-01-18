import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProject, listProjectTasks, addTask, updateTaskStatus, listCommentsForTask, listCommentsForProject, addComment, updateComment, deleteCommentDoc, listActivityForProject, getUsersByIds } from '../utils/firestore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import Leaderboard from '../components/Leaderboard.jsx'
import { triggerConfetti, playSuccessSound } from '../utils/effects'

function TaskColumn({ title, status, tasks, onStatusChange, onComment, onUpdateComment, onDeleteComment, projectId, user }) {
  const statusColors = {
    'To Do': 'from-gray-500 to-gray-300',
    'In Progress': 'from-blue-500 to-cyan-400',
    'Done': 'from-green-500 to-emerald-400'
  }
  
  const priorityColors = {
    'High': 'border border-red-500/30 bg-red-500/15',
    'Medium': 'border border-orange-500/30 bg-orange-500/15',
    'Low': 'border border-blue-500/30 bg-blue-500/15'
  }

  return (
    <div className="card cinematic-panel p-4 text-slate-900">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusColors[status]}`}></div>
        <h3 className="font-bold">{title}</h3>
        <span className="ml-auto text-xs font-medium text-slate-500">{tasks.filter(t => t.status === status).length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps} 
            className={`space-y-2 min-h-[120px] rounded-lg p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-orange-50' : 'bg-slate-50'}`}
          >
            {tasks.filter(t => t.status === status).map((t, idx) => (
              <Draggable key={t.id} draggableId={t.id} index={idx}>
                {(prov, snap) => (
                  <div 
                    ref={prov.innerRef} 
                    {...prov.draggableProps} 
                    {...prov.dragHandleProps} 
                    className={`rounded-lg p-3 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all text-slate-900 ${priorityColors[t.priority]} ${snap.isDragging ? 'rotate-2 scale-105 shadow-lg shadow-orange-200/70' : ''}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{t.title}</div>
                          <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-slate-600">
                            <span className={`px-2 py-0.5 rounded font-medium ${t.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' : t.priority === 'Medium' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                              {t.priority}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {t.points}
                            </span>
                            {t.deadline && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(t.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-800 border border-slate-200">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold">
                              {(t.assignedName || t.assignedTo || '?').slice(0,1).toUpperCase()}
                            </div>
                            <div className="leading-tight">
                              <div className="font-semibold text-slate-900 text-xs">{t.assignedName || 'Unassigned'}</div>
                              <div className="text-[11px] text-slate-500">Assignee</div>
                            </div>
                          </div>
                          {status !== 'Done' && (
                            <button 
                              className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors" 
                              onClick={() => onStatusChange(t, 'Done')}
                              title="Mark as done"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <CommentThread 
                        taskId={t.id} 
                        projectId={projectId}
                        user={user}
                        onAdd={(text) => onComment(t, text)}
                        onUpdate={(c, newText) => onUpdateComment(c, newText)}
                        onDelete={(c) => onDeleteComment(c)}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="text-center py-8 text-sm text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                No tasks yet
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function CommentThread({ taskId, projectId, onAdd, onUpdate, onDelete, user }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  useEffect(() => {
    const unsub = listCommentsForTask(taskId, setComments)
    return () => unsub && unsub()
  }, [taskId])
  return (
    <div className="mt-2">
      <div className="space-y-2 text-slate-700">
        {comments.map(c => (
          <div key={c.id} className="text-sm flex items-start gap-2">
            <div className="font-medium text-slate-900">{c.userName || c.user}:</div>
            {editingId === c.id ? (
              <div className="flex-1 flex flex-col gap-2">
                <input className="input" value={editText} onChange={(e) => setEditText(e.target.value)} />
                <div className="flex gap-2 text-xs">
                  <button className="btn-primary px-2 py-1" onClick={() => { onUpdate(c, editText); setEditingId(null); }}>Save</button>
                  <button className="btn-secondary px-2 py-1" onClick={() => { setEditingId(null); setEditText('') }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <span>{c.text}</span>
                {user?.uid === c.user && (
                  <div className="flex gap-1 text-[11px] text-slate-500">
                    <button className="underline" onClick={() => { setEditingId(c.id); setEditText(c.text) }}>Edit</button>
                    <button className="underline" onClick={() => onDelete(c)}>Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input className="input" placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-secondary" onClick={() => { if (text.trim()) { onAdd(text.trim()); setText('') } }}>Send</button>
      </div>
    </div>
  )
}

export default function Project({ user }) {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [activity, setActivity] = useState([])
  const [members, setMembers] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [deadline, setDeadline] = useState('')
  const [assignee, setAssignee] = useState(user.uid)
  const [query, setQuery] = useState('')
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [recentComments, setRecentComments] = useState([])

  useEffect(() => {
    const unsubP = getProject(projectId, setProject)
    const unsubT = listProjectTasks(projectId, setTasks)
    const unsubA = listActivityForProject(projectId, setActivity)
    const unsubC = listCommentsForProject(projectId, setRecentComments)
    return () => { unsubP && unsubP(); unsubT && unsubT(); unsubA && unsubA(); unsubC && unsubC() }
  }, [projectId])

  // Load member profiles for assignment dropdown and labels
  useEffect(() => {
    if (!project?.members?.length) {
      setMembers([])
      return
    }
    getUsersByIds(project.members).then(setMembers).catch(() => setMembers([]))
  }, [project?.members])

  const grouped = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'To Do'),
    progress: tasks.filter(t => t.status === 'In Progress'),
    done: tasks.filter(t => t.status === 'Done'),
  }), [tasks])

  const handleAddTask = async () => {
    if (!title.trim()) {
      toast.error('Give the task a title')
      return
    }
    const assignedUser = members.find((m) => m.id === assignee)
    const optimistic = {
      id: `tmp-${Date.now()}`,
      title,
      description: '',
      assignedTo: assignee,
      assignedName: assignedUser?.name || assignedUser?.email || 'Teammate',
      priority,
      status: 'To Do',
      points: 10,
      deadline,
      projectId,
      createdBy: user.uid,
      createdAt: new Date(),
    }
    setTasks((prev) => [optimistic, ...prev])
    try {
      await addTask(projectId, {
        title,
        description: '',
        assignedTo: assignee,
        assignedName: assignedUser?.name || assignedUser?.email || 'Teammate',
        priority,
        status: 'To Do',
        points: 10,
        deadline,
      }, user)
      toast.success('Task added')
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id))
      toast.error('Could not add task')
    }
    setTitle('')
    setDeadline('')
    setPriority('Medium')
    setAssignee(user.uid)
  }

  const onStatusChange = async (task, status) => {
    await updateTaskStatus(projectId, task, status, user)
    if (status === 'Done') {
      triggerConfetti()
      playSuccessSound()
      toast.success('🎉 Task completed! Great job!', {
        duration: 4000,
        icon: '✨',
      })
    } else {
      toast.success('Task updated')
    }
  }

  const onComment = async (task, text) => {
    await addComment(task.id, projectId, { text }, user)
    toast.success('Comment added')
  }

  const onUpdateComment = async (comment, text) => {
    if (!text.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    await updateComment(comment.id, { text })
    toast.success('Comment updated')
  }

  const onDeleteComment = async (comment) => {
    const ok = window.confirm('Delete this comment?')
    if (!ok) return
    await deleteCommentDoc(comment.id)
    toast.success('Comment deleted')
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => (
      (!query || t.title.toLowerCase().includes(query.toLowerCase())) &&
      (assignmentFilter === 'all' || (assignmentFilter === 'mine' ? t.assignedTo === user.uid : t.assignedTo !== user.uid)) &&
      (priorityFilter === 'all' || t.priority === priorityFilter)
    ))
  }, [tasks, query, assignmentFilter, priorityFilter, user.uid])

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    const destStatus = destination.droppableId
    if (source.droppableId === destStatus) return
    const task = tasks.find(t => t.id === draggableId)
    if (task) await onStatusChange(task, destStatus)
  }

  // Deadline alerts for tasks assigned to the user within 48 hours
  const nearing = tasks.filter(t => t.assignedTo === user.uid && t.status !== 'Done' && t.deadline)
    .filter(t => {
      const diff = new Date(t.deadline).getTime() - Date.now()
      return diff > 0 && diff <= 48 * 60 * 60 * 1000
    })

  if (!project) return <div className="text-slate-900">Loading…</div>

  return (
    <div className="space-y-6 text-slate-900">
      <div className="card p-4 cinematic-panel">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{project.title}</h2>
            <p className="text-sm text-slate-600">{project.description}</p>
          </div>
          <div className="text-sm text-slate-600">Members: {project.members?.length || 0}</div>
        </div>
      </div>

      {nearing.length > 0 && (
        <div className="card p-3 bg-yellow-50 border border-yellow-200 text-yellow-800">
          <div className="text-sm">You have {nearing.length} task(s) nearing deadline in the next 48 hours.</div>
        </div>
      )}

      <div className="card p-4 cinematic-panel">
        <div className="flex items-center justify-between mb-3 text-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-600">Scene • Task Board</p>
            <h3 className="text-xl font-semibold">Add Task</h3>
          </div>
          <span className="text-xs text-slate-500">Assign to teammates and set priority</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <input className="input" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            {members.length === 0 && <option value={user.uid}>You</option>}
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name || m.email || 'Teammate'}</option>
            ))}
          </select>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button className="btn-primary" onClick={handleAddTask}>Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <input className="input" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)}>
            <option value="all">All tasks</option>
            <option value="mine">Assigned to me</option>
            <option value="others">Assigned to others</option>
          </select>
          <select className="input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="btn-secondary" onClick={() => {
            const header = ['Title','Assignee','Priority','Status','Points','Deadline']
            const rows = tasks.map(t => [t.title, t.assignedName || t.assignedTo, t.priority, t.status, t.points, t.deadline || ''])
            const csv = [header.join(','), ...rows.map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g,'"')}`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project.title.replace(/\s+/g,'_')}_tasks.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}>Export CSV</button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TaskColumn title="To Do" status="To Do" tasks={filteredTasks} projectId={projectId} user={user} onStatusChange={onStatusChange} onComment={onComment} onUpdateComment={onUpdateComment} onDeleteComment={onDeleteComment} />
          <TaskColumn title="In Progress" status="In Progress" tasks={filteredTasks} projectId={projectId} user={user} onStatusChange={onStatusChange} onComment={onComment} onUpdateComment={onUpdateComment} onDeleteComment={onDeleteComment} />
          <TaskColumn title="Done" status="Done" tasks={filteredTasks} projectId={projectId} user={user} onStatusChange={onStatusChange} onComment={onComment} onUpdateComment={onUpdateComment} onDeleteComment={onDeleteComment} />
        </div>
      </DragDropContext>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card cinematic-panel p-3 md:col-span-2">
          <h3 className="font-semibold mb-2 text-slate-900">Activity</h3>
          <div className="space-y-2 text-slate-700">
            {activity.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">{new Date(a.timestamp?.toDate?.() ?? a.timestamp).toLocaleString()}</span>
                <span>•</span>
                <span>{a.action}</span>
              </div>
            ))}
            {activity.length === 0 && <div className="text-sm text-slate-500">No activity yet.</div>}
          </div>
        </div>
        <div className="card cinematic-panel p-3">
          <h3 className="font-semibold mb-2 text-slate-900">Leaderboard</h3>
          <Leaderboard projectId={projectId} />
        </div>
      </div>

      <div className="card cinematic-panel p-3">
        <h3 className="font-semibold mb-2 text-slate-900">Recent Comments</h3>
        <div className="space-y-2 text-slate-700 max-h-72 overflow-y-auto pr-1">
          {recentComments.map(c => (
            <div key={c.id} className="text-sm p-2 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{c.userName || 'Anon'}</span>
                <span>·</span>
                <span>{c.timestamp?.toDate?.() ? c.timestamp.toDate().toLocaleString() : ''}</span>
              </div>
              <div className="text-slate-800">{c.text}</div>
            </div>
          ))}
          {recentComments.length === 0 && <div className="text-sm text-slate-500">No comments yet.</div>}
        </div>
      </div>
    </div>
  )
}
