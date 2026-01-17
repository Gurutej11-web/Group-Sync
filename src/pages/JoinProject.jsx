import { useState } from 'react'
import { joinProjectByCode } from '../utils/firestore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function JoinProject({ user }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const onJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const projectId = await joinProjectByCode(code.trim(), user.uid)
      toast.success('Joined project!')
      navigate(`/project/${projectId}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-md">
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-2">Join a Project</h2>
        <label className="label">Invite Code</label>
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter invite code" />
        <button className="btn-primary mt-3" onClick={onJoin} disabled={loading}>{loading ? 'Joining…' : 'Join Project'}</button>
      </div>
    </div>
  )
}
