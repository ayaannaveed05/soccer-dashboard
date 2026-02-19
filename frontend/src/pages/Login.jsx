import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useStore from '../store'
import { API_URL } from '../config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useStore()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      })
      login(res.data.user, res.data.access_token)
      navigate('/')  // Redirect to home after login
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '0 2rem' }}>
      <h1 style={{
        fontFamily: 'Bebas Neue',
        fontSize: '3rem',
        letterSpacing: '2px',
        marginBottom: '0.5rem'
      }}>
        LOGIN
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Don't have an account? <Link to="/register" style={{ color: '#00ff87' }}>Register</Link>
      </p>

      {/* Error message */}
      {error && (
        <p style={{
          color: '#ff4444',
          background: '#1a0000',
          border: '1px solid #ff4444',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: '#111', border: '1px solid #222', color: '#fff',
              padding: '0.75rem 1rem', fontSize: '1rem', width: '100%', outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: '#111', border: '1px solid #222', color: '#fff',
              padding: '0.75rem 1rem', fontSize: '1rem', width: '100%', outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: '#00ff87', color: '#000', border: 'none',
            padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem',
            letterSpacing: '1px', cursor: 'pointer', marginTop: '0.5rem'
          }}
        >
          {loading ? 'LOGGING IN...' : 'LOGIN →'}
        </button>
      </div>
    </div>
  )
}