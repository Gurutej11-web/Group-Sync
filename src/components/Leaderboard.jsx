import { useEffect, useState } from 'react'
import { aggregateLeaderboard } from '../utils/firestore'

export default function Leaderboard({ projectId }) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    const unsub = aggregateLeaderboard(projectId, setRows)
    return () => unsub && unsub()
  }, [projectId])

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.user} className="flex items-center justify-between border rounded p-2">
          <div>
            <div className="font-medium">{r.userName || r.user}</div>
            <div className="text-xs text-gray-600">Badges: {r.badges?.join(', ') || '-'}</div>
          </div>
          <div className="font-semibold">{r.points} pts</div>
        </div>
      ))}
      {rows.length === 0 && <div className="text-sm text-gray-600">No points yet.</div>}
    </div>
  )
}
