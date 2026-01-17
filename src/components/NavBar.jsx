import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebaseConfig'

export default function NavBar({ user }) {
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
