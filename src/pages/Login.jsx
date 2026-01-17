import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebaseConfig'
import { ensureUserDoc } from '../utils/firestore'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name) await updateProfile(cred.user, { displayName: name })
        await ensureUserDoc(cred.user)
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        await ensureUserDoc(cred.user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-4">{isSignup ? 'Create an account' : 'Welcome back'}</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Login'}
          </button>
        </form>
        <div className="mt-3">
          <button className="btn-secondary w-full" disabled={loading} onClick={async () => {
            setError('')
            setLoading(true)
            try {
              const cred = await signInWithPopup(auth, googleProvider)
              await ensureUserDoc(cred.user)
            } catch (err) {
              setError(err.message)
            } finally {
              setLoading(false)
            }
          }}>Continue with Google</button>
        </div>
        <div className="mt-4 text-sm">
          {isSignup ? (
            <span>Already have an account? <button className="text-primary-700" onClick={() => setIsSignup(false)}>Login</button></span>
          ) : (
            <span>New here? <button className="text-primary-700" onClick={() => setIsSignup(true)}>Create account</button></span>
          )}
        </div>
      </div>
    </div>
  )
}
