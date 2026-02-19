import { Link, useLocation, useNavigate } from 'react-router-dom'
import useStore from '../store'

// Main navigation bar component
// Displays navigation links and auth controls based on login state
export default function Navbar() {
  // Current route info (used to highlight active links)
  const location = useLocation()

  // Programmatic navigation (used after logout)
  const navigate = useNavigate()

  // Global auth state from Zustand
  const { user, logout } = useStore()

  // Helper to check if a nav link matches the current route
  const isActive = (path) => location.pathname === path

  // Logout handler:
  // - Clears auth state
  // - Redirects user to home page
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav
      style={{
        background: '#111111',
        borderBottom: '1px solid #2a2a2a',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo / Brand */}
      <Link
        to="/"
        style={{
          fontFamily: 'Bebas Neue',
          fontSize: '1.5rem',
          color: '#00ff87',
          letterSpacing: '3px',
          flexShrink: 0,
        }}
      >
        KICKSTATS
      </Link>

      {/* Navigation links */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {[
          { path: '/', label: 'Home' },
          { path: '/teams', label: 'Teams' },
          { path: '/standings', label: 'Standings' },
          { path: '/predict', label: 'Predict' },
          { path: '/how-it-works', label: 'How It Works' },
          { path: '/favourites', label: 'Favourites' },
          { path: '/history', label: 'History' },
        ].map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              color: isActive(path) ? '#f0f0f0' : '#888',
              fontSize: '0.85rem',
              fontWeight: isActive(path) ? 600 : 400,
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              background: isActive(path) ? '#1e1e1e' : 'transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            // Hover styles for inactive links
            onMouseEnter={(e) => {
              if (!isActive(path)) e.currentTarget.style.color = '#f0f0f0'
            }}
            onMouseLeave={(e) => {
              if (!isActive(path)) e.currentTarget.style.color = '#888'
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Authentication section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        {user ? (
          <>
            {/* Logged-in user badge */}
            <span
              style={{
                color: '#888',
                fontSize: '0.85rem',
                background: '#1e1e1e',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid #2a2a2a',
              }}
            >
              {user.username}
            </span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #2a2a2a',
                color: '#888',
                padding: '0.3rem 0.75rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#444'
                e.currentTarget.style.color = '#f0f0f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.color = '#888'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          // Login button for unauthenticated users
          <Link
            to="/login"
            style={{
              background: '#00ff87',
              color: '#000',
              padding: '0.35rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
