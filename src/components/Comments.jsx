import { useEffect, useState } from 'react'
import { listCommentsForTask, addComment } from '../utils/firestore'

export default function Comments({ taskId, user }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  useEffect(() => {
    const unsub = listCommentsForTask(taskId, setComments)
    return () => unsub && unsub()
  }, [taskId])
  return (
    <div>
      <div className="space-y-1">
        {comments.map(c => (
          <div key={c.id} className="text-sm"><span className="font-medium">{c.userName || c.user}</span>: {c.text}</div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input className="input" placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-secondary" onClick={() => { if (text.trim()) { addComment(taskId, { text }, user); setText('') } }}>Send</button>
      </div>
    </div>
  )
}
