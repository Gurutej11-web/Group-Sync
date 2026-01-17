import { useEffect, useState } from 'react'
import { updateUserProfile, getUserDoc } from '../utils/firestore'

export default function UserProfile({ user }) {
  const [profile, setProfile] = useState({ name: user.displayName || '', avatar: '', role: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const doc = await getUserDoc(user.uid)
      if (doc) setProfile(prev => ({ ...prev, ...doc }))
    })()
  }, [user.uid])

  const save = async () => {
    setSaving(true)
    await updateUserProfile(user.uid, profile)
    setSaving(false)
  }

  return (
    <div className="max-w-md">
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input className="input" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} placeholder="Leader / Designer / Researcher" />
          </div>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  )
}
