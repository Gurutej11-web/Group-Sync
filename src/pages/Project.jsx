import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProject, listProjectTasks, addTask, updateTaskStatus, listCommentsForTask, addComment, listActivityForProject } from '../utils/firestore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import Leaderboard from '../components/Leaderboard.jsx'

function TaskColumn({ title, status, tasks, onStatusChange, onComment }) {
  return (
    <div className="card p-3">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Droppable droppableId={status}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[60px]">
            {tasks.filter(t => t.status === status).map((t, idx) => (
              <Draggable key={t.id} draggableId={t.id} index={idx}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="border rounded p-2 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-gray-600">Priority: {t.priority} • Points: {t.points}</div>
                      </div>
                      <div className="flex gap-2">
                        {status !== 'To Do' && <button className="btn-secondary" onClick={() => onStatusChange(t, 'To Do')}>To Do</button>}
                        {status !== 'In Progress' && <button className="btn-secondary" onClick={() => onStatusChange(t, 'In Progress')}>In Progress</button>}
                        {status !== 'Done' && <button className="btn-primary" onClick={() => onStatusChange(t, 'Done')}>Done</button>}
                      </div>
                    </div>
                    <CommentThread taskId={t.id} onAdd={(text) => onComment(t, text)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="text-sm text-gray-600">No tasks.</div>
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
    if (status === 'Done') toast.success('Task completed')
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
