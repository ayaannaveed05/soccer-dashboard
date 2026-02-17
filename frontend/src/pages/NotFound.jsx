import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      maxWidth: '500px', margin: '6rem auto',
      padding: '2rem', textAlign: 'center'
    }}>
      <p style={{
        fontFamily: 'Bebas Neue', fontSize: '6rem',
        color: '#2a2a2a', lineHeight: 1, marginBottom: '1rem'
      }}>
        404
      </p>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Page not found
      </h1>
      <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" style={{
        background: '#00ff87', color: '#000',
        padding: '0.6rem 1.5rem', fontWeight: 600,
        fontSize: '0.875rem', borderRadius: '4px'
      }}>
        Go home
      </Link>
    </div>
  )
}