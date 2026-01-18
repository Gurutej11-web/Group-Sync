import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebaseConfig'

export default function NavBar({ user }) {
  const navigate = useNavigate()
  const homeHref = user ? '/dashboard' : '/'
  return (
    <nav className="cinematic-nav sticky top-0 z-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={homeHref} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-400 to-orange-300 flex items-center justify-center shadow-md shadow-fuchsia-200/60 group-hover:shadow-fuchsia-300/70 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-slate-900">GroupSync</span>
              <span className="text-[11px] tracking-[0.25em] uppercase text-slate-500">Studio Mode</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-slate-800 hover:text-slate-900 bg-white/70 hover:bg-white rounded-lg transition-colors border border-slate-200">
                  Dashboard
                </Link>
                <Link to="/interaction" className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors border border-orange-200">
                  Team Pulse
                </Link>
                <Link to="/join" className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors border border-purple-200">
                  + Join Project
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-orange-200/60">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-slate-900">{user.displayName || 'Profile'}</span>
                </Link>
                <button 
                  className="px-4 py-2 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200" 
                  onClick={() => signOut(auth).then(() => navigate('/login'))}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login?mode=signup" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-orange-400 text-white rounded-lg shadow-md shadow-orange-200/60 hover:shadow-lg transition-shadow">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
