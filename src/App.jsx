import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Project from './pages/Project.jsx'
import UserProfile from './components/UserProfile.jsx'
import JoinProject from './pages/JoinProject.jsx'
import { Toaster } from 'react-hot-toast'

function NavBar({ user }) {
  const navigate = useNavigate()
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-primary-700 font-semibold">GroupSync</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/" className="btn-secondary">Dashboard</Link>
              <Link to="/profile" className="btn-secondary">Profile</Link>
              <button className="btn-primary" onClick={() => signOut(auth).then(() => navigate('/login'))}>Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen">
      <NavBar user={user} />
      <Toaster position="top-right" />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/project/:projectId" element={user ? <Project user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />
          <Route path="/join" element={user ? <JoinProject user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
