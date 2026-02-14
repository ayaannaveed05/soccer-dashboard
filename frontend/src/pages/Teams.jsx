import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState('')  // Selected league filter
  const [loading, setLoading] = useState(true)

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

  // Filter by search AND league
  const filtered = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesLeague = league === '' || t.league === league
    return matchesSearch && matchesLeague
  })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{
        fontFamily: 'Bebas Neue',
        fontSize: '3rem',
        letterSpacing: '2px',
        marginBottom: '0.5rem',
      }}>
        TEAMS
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Top 5 European Leagues</p>

      {/* Search and filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
            width: '300px',
            outline: 'none',
          }}
        />
        
        <select
          value={league}
          onChange={e => setLeague(e.target.value)}
          style={{
            background: '#111',
            border: '1px solid #222',
            color: '#fff',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Leagues</option>
          <option value="Premier League">Premier League</option>
          <option value="La Liga">La Liga</option>
          <option value="Bundesliga">Bundesliga</option>
          <option value="Serie A">Serie A</option>
          <option value="Ligue 1">Ligue 1</option>
        </select>
      </div>

      {/* Team count */}
      {!loading && (
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Showing {filtered.length} teams
        </p>
      )}

      {/* Teams grid */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading teams...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(team => (
            <div key={team.id} style={{
              background: '#111',
              border: '1px solid #222',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00ff87'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
            >
              {/* Team crest */}
              {team.crest && (
                <img
                  src={team.crest}
                  alt={team.name}
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              )}

              {/* Team info */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                  {team.name}
                </h3>
                <p style={{ color: '#00ff87', fontSize: '0.8rem', fontWeight: 600 }}>
                  {team.league}
                </p>
                {team.venue && (
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {team.venue}
                  </p>
                )}
                {team.founded && (
                  <p style={{ color: '#555', fontSize: '0.75rem' }}>
                    Est. {team.founded}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}