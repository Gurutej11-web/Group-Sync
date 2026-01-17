export default function TaskCard({ task, onStatusChange }) {
  return (
    <div className="border rounded p-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{task.title}</div>
          <div className="text-xs text-gray-600">Priority: {task.priority} • Points: {task.points}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => onStatusChange(task, 'To Do')}>To Do</button>
          <button className="btn-secondary" onClick={() => onStatusChange(task, 'In Progress')}>In Progress</button>
          <button className="btn-primary" onClick={() => onStatusChange(task, 'Done')}>Done</button>
        </div>
      </div>
    </div>
  )
}
