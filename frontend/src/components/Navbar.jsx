import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()  // Get current page to highlight active link

  // Check if link is currently active
  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: '#0a0a0a',
      borderBottom: '1px solid #222',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: 'Bebas Neue',
        fontSize: '1.8rem',
        color: '#00ff87',
        letterSpacing: '2px',
      }}>
        KICKSTATS
      </Link>

      {/* Navigation links */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {[
          { path: '/', label: 'Home' },
          { path: '/teams', label: 'Teams' },
          { path: '/predict', label: 'Predict' },
        ].map(({ path, label }) => (
          <Link key={path} to={path} style={{
            color: isActive(path) ? '#00ff87' : '#888',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'color 0.2s',
            borderBottom: isActive(path) ? '2px solid #00ff87' : '2px solid transparent',
            paddingBottom: '4px',
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}