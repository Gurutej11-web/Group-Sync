import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      // Cmd/Ctrl + K for quick navigation
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Show command palette (future enhancement)
        console.log('Command palette')
      }

      // G then D for Dashboard
      if (e.key === 'g') {
        const secondKeyListener = (e2) => {
          if (e2.key === 'd') navigate('/')
          if (e2.key === 'j') navigate('/join')
          if (e2.key === 'p') navigate('/profile')
          window.removeEventListener('keydown', secondKeyListener)
        }
        window.addEventListener('keydown', secondKeyListener)
        setTimeout(() => window.removeEventListener('keydown', secondKeyListener), 1000)
      }

      // ? for help
      if (e.key === '?') {
        alert(`Keyboard Shortcuts:
        
g + d → Dashboard
g + j → Join Project
g + p → Profile
? → Show this help

Press ESC to dismiss`)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigate])
}
