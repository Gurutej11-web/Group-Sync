import { useEffect, useState } from 'react'
import { listActivityForProject } from '../utils/firestore'

export default function ActivityFeed({ projectId }) {
  const [activity, setActivity] = useState([])
  useEffect(() => {
    const unsub = listActivityForProject(projectId, setActivity)
    return () => unsub && unsub()
  }, [projectId])
  return (
    <div className="space-y-2">
      {activity.map(a => (
        <div key={a.id} className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">{new Date(a.timestamp?.toDate?.() ?? a.timestamp).toLocaleString()}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-900">{a.action}</span>
        </div>
      ))}
      {activity.length === 0 && <div className="text-sm text-slate-600">No activity yet.</div>}
    </div>
  )
}
