import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import NavBar from './components/NavBar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Project from './pages/Project.jsx'
import UserProfile from './components/UserProfile.jsx'
import JoinProject from './pages/JoinProject.jsx'
import { Toaster } from 'react-hot-toast'
import { useKeyboardShortcuts } from './utils/useKeyboardShortcuts'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useKeyboardShortcuts()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Loading GroupSync...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      <NavBar user={user} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/project/:projectId" element={user ? <Project user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />
          <Route path="/join" element={user ? <JoinProject user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {/* Keyboard Shortcut Indicator */}
      {user && (
        <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs text-gray-600 border border-gray-200 hidden lg:block">
          <div className="font-semibold mb-1 text-purple-600">⌨️ Shortcuts</div>
          <div className="space-y-0.5">
            <div><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">g</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">d</kbd> Dashboard</div>
            <div><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">g</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">j</kbd> Join</div>
            <div><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">?</kbd> Help</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
