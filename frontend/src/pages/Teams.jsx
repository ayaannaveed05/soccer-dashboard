import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Teams() {
  const [teams, setTeams] = useState([])  // All teams
  const [search, setSearch] = useState('')  // Search input value
  const [loading, setLoading] = useState(true)

  // Fetch all teams on load
  useEffect(() => {
    axios.get('http://localhost:8000/api/teams/')
      .then(res => {
        setTeams(res.data.teams)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Filter teams based on search input
  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{
        fontFamily: 'Bebas Neue',
        fontSize: '3rem',
        letterSpacing: '2px',
        marginBottom: '2rem',
      }}>
        TEAMS
      </h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search teams..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          background: '#111',
          border: '1px solid #222',
          color: '#fff',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '2rem',
          outline: 'none',
        }}
      />

      {/* Teams grid */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(team => (
            <div key={team.id} style={{
              background: '#111',
              border: '1px solid #222',
              padding: '1.5rem',
              transition: 'border-color 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00ff87'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
            >
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{team.name}</h3>
              <p style={{ color: '#00ff87', fontSize: '0.85rem', fontWeight: 600 }}>{team.league}</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{team.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}