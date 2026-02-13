import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Home() {
  const [matches, setMatches] = useState([])  // Store matches from API
  const [loading, setLoading] = useState(true)  // Track loading state

  // Fetch upcoming matches when component loads
  useEffect(() => {
    axios.get('http://localhost:8000/api/matches/upcoming')
      .then(res => {
        setMatches(res.data.matches)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

      {/* Hero */}
      <div style={{ marginBottom: '4rem' }}>
        <p style={{ color: '#00ff87', fontWeight: 600, letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '1rem' }}>
          SOCCER ANALYTICS
        </p>
        <h1 style={{
          fontFamily: 'Bebas Neue',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          lineHeight: 1,
          marginBottom: '1.5rem',
        }}>
          MATCH<br />
          <span style={{ color: '#00ff87' }}>PREDICTIONS</span><br />
          & STATS
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
          ML-powered match outcome predictions across Europe's top leagues.
        </p>
        <Link to="/predict" style={{
          background: '#00ff87',
          color: '#000',
          padding: '0.75rem 2rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '1px',
          display: 'inline-block',
        }}>
          PREDICT A MATCH →
        </Link>
      </div>

      {/* Upcoming Matches */}
      <div>
        <h2 style={{
          fontFamily: 'Bebas Neue',
          fontSize: '2rem',
          letterSpacing: '2px',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #222',
          paddingBottom: '1rem',
        }}>
          UPCOMING MATCHES
        </h2>

        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map(match => (
              <div key={match.id} style={{
                background: '#111',
                border: '1px solid #222',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Teams */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{match.home_team}</span>
                  <span style={{ color: '#00ff87', fontFamily: 'Bebas Neue', fontSize: '1.2rem' }}>VS</span>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{match.away_team}</span>
                </div>

                {/* Date and league */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>{match.date}</p>
                  <p style={{ color: '#00ff87', fontSize: '0.8rem', fontWeight: 600 }}>{match.league}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}