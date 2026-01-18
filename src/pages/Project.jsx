import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProject, listProjectTasks, addTask, updateTaskStatus, listCommentsForTask, addComment, listActivityForProject } from '../utils/firestore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import Leaderboard from '../components/Leaderboard.jsx'
import { triggerConfetti, playSuccessSound } from '../utils/effects'

function TaskColumn({ title, status, tasks, onStatusChange, onComment }) {
  const statusColors = {
    'To Do': 'from-gray-500 to-gray-600',
    'In Progress': 'from-blue-500 to-blue-600',
    'Done': 'from-green-500 to-green-600'
  }
  
  const priorityColors = {
    'High': 'border-l-4 border-red-500 bg-red-50',
    'Medium': 'border-l-4 border-orange-500 bg-orange-50',
    'Low': 'border-l-4 border-blue-500 bg-blue-50'
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusColors[status]}`}></div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="ml-auto text-xs font-medium text-gray-500">{tasks.filter(t => t.status === status).length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps} 
            className={`space-y-2 min-h-[100px] rounded-lg p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-purple-50' : 'bg-gray-50'}`}
          >
            {tasks.filter(t => t.status === status).map((t, idx) => (
              <Draggable key={t.id} draggableId={t.id} index={idx}>
                {(prov, snap) => (
                  <div 
                    ref={prov.innerRef} 
                    {...prov.draggableProps} 
                    {...prov.dragHandleProps} 
                    className={`rounded-lg p-3 bg-white border shadow-sm hover:shadow-md transition-all ${priorityColors[t.priority]} ${snap.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{t.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span className={`px-2 py-0.5 rounded font-medium ${t.priority === 'High' ? 'bg-red-100 text-red-700' : t.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
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
                        <div className="flex gap-1">
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
                      <CommentThread taskId={t.id} onAdd={(text) => onComment(t, text)} />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400">
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

function CommentThread({ taskId, onAdd }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  useEffect(() => {
    const unsub = listCommentsForTask(taskId, setComments)
    return () => unsub && unsub()
  }, [taskId])
  return (
    <div className="mt-2">
      <div className="space-y-1">
        {comments.map(c => (
          <div key={c.id} className="text-sm"><span className="font-medium">{c.userName || c.user}</span>: {c.text}</div>
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
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [deadline, setDeadline] = useState('')
  const [query, setQuery] = useState('')
  const [assignmentFilter, setAssignmentFilter] = useState('all')

  useEffect(() => {
    const unsubP = getProject(projectId, setProject)
    const unsubT = listProjectTasks(projectId, setTasks)
    const unsubA = listActivityForProject(projectId, setActivity)
    return () => { unsubP && unsubP(); unsubT && unsubT(); unsubA && unsubA() }
  }, [projectId])

  const grouped = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'To Do'),
    progress: tasks.filter(t => t.status === 'In Progress'),
    done: tasks.filter(t => t.status === 'Done'),
  }), [tasks])

  const handleAddTask = async () => {
    if (!title.trim()) return
    await addTask(projectId, {
      title,
      description: '',
      assignedTo: user.uid,
      priority,
      status: 'To Do',
      points: 10,
      deadline,
    }, user)
    setTitle('')
    setDeadline('')
    setPriority('Medium')
    toast.success('Task added')
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
    await addComment(task.id, { text }, user)
    toast.success('Comment added')
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => (
      (!query || t.title.toLowerCase().includes(query.toLowerCase())) &&
      (assignmentFilter === 'all' || (assignmentFilter === 'mine' ? t.assignedTo === user.uid : t.assignedTo !== user.uid))
    ))
  }, [tasks, query, assignmentFilter, user.uid])

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

  if (!project) return <div>Loading…</div>

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{project.title}</h2>
            <p className="text-sm text-gray-600">{project.description}</p>
          </div>
          <div className="text-sm">Members: {project.members?.length || 0}</div>
        </div>
      </div>

      {nearing.length > 0 && (
        <div className="card p-3 bg-yellow-50 border-yellow-200">
          <div className="text-sm">You have {nearing.length} task(s) nearing deadline in the next 48 hours.</div>
        </div>
      )}

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Add Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="input" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button className="btn-primary" onClick={handleAddTask}>Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <input className="input" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)}>
            <option value="all">All tasks</option>
            <option value="mine">Assigned to me</option>
            <option value="others">Assigned to others</option>
          </select>
          <button className="btn-secondary" onClick={() => {
            // Export CSV of tasks
            const header = ['Title','AssignedTo','Priority','Status','Points','Deadline']
            const rows = tasks.map(t => [t.title, t.assignedTo, t.priority, t.status, t.points, t.deadline || ''])
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
          <TaskColumn title="To Do" status="To Do" tasks={filteredTasks} onStatusChange={onStatusChange} onComment={onComment} />
          <TaskColumn title="In Progress" status="In Progress" tasks={filteredTasks} onStatusChange={onStatusChange} onComment={onComment} />
          <TaskColumn title="Done" status="Done" tasks={filteredTasks} onStatusChange={onStatusChange} onComment={onComment} />
        </div>
      </DragDropContext>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-3 md:col-span-2">
          <h3 className="font-semibold mb-2">Activity</h3>
          <div className="space-y-2">
            {activity.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{new Date(a.timestamp?.toDate?.() ?? a.timestamp).toLocaleString()}</span>
                <span>•</span>
                <span>{a.action}</span>
              </div>
            ))}
            {activity.length === 0 && <div className="text-sm text-gray-600">No activity yet.</div>}
          </div>
        </div>
        <div className="card p-3">
          <h3 className="font-semibold mb-2">Leaderboard</h3>
          <Leaderboard projectId={projectId} />
        </div>
      </div>
    </div>
  )
}
