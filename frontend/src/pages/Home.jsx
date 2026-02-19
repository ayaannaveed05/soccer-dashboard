import { API_URL } from '../config'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { SkeletonCard } from '../components/Skeleton'

export default function Home() {
  // Upcoming fixtures + recent results state
  const [upcoming, setUpcoming] = useState([])
  const [recent, setRecent] = useState([])

  // Loading state for skeleton UI
  const [loading, setLoading] = useState(true)

  // Fetch upcoming + recent matches on initial page load
  useEffect(() => {
    // Run both API requests in parallel for faster load time
    Promise.all([
      axios.get(`${API_URL}/api/matches/upcoming`),
      axios.get(`${API_URL}/api/matches/recent`),
    ])
      .then(([upRes, reRes]) => {
        // Store results from backend
        setUpcoming(upRes.data.matches)
        setRecent(reRes.data.matches)
        setLoading(false)
      })
      .catch(() => setLoading(false)) // Ensure loading state ends even if requests fail
  }, [])

  // Format YYYY-MM-DD into a compact UI-friendly date (e.g., "17 Feb")
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem' }}>
      {/* Hero section (intro + CTAs) */}
      <div
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '4px',
          padding: '3rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <div>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#00ff8715',
              border: '1px solid #00ff8730',
              borderRadius: '100px',
              padding: '0.25rem 0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00ff87',
              }}
            />
            <span
              style={{
                color: '#00ff87',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              ML-POWERED PREDICTIONS
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '1px',
              lineHeight: 1.05,
              marginBottom: '1rem',
              color: '#f0f0f0',
            }}
          >
            Football predictions
            <br />
            <span style={{ color: '#00ff87' }}>powered by data</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              color: '#888',
              fontSize: '0.95rem',
              maxWidth: '420px',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            Real-time fixtures, league standings, and machine learning match
            predictions across Europe's top 5 leagues.
          </p>

          {/* Call-to-action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to="/predict"
              style={{
                background: '#00ff87',
                color: '#000',
                padding: '0.6rem 1.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '4px',
                letterSpacing: '0.3px',
              }}
            >
              Predict a match
            </Link>

            <Link
              to="/standings"
              style={{
                background: 'transparent',
                color: '#888',
                padding: '0.6rem 1.5rem',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderRadius: '4px',
                border: '1px solid #2a2a2a',
              }}
            >
              View standings
            </Link>
          </div>
        </div>

        {/* Stats grid (quick credibility indicators) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          {[
            { value: '4,500+', label: 'Matches trained' },
            { value: '68%', label: 'Model accuracy' },
            { value: '5', label: 'Leagues covered' },
            { value: '100+', label: 'Teams available' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: '#0d0d0d',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
                padding: '1rem 1.25rem',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: '1.8rem',
                  color: '#f0f0f0',
                  lineHeight: 1,
                }}
              >
                {value}
              </p>
              <p
                style={{
                  color: '#555',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Matches grid */}
      {loading ? (
        // Loading skeleton UI (matches layout of final UI to avoid layout shift)
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                height: '20px',
                width: '140px',
                background: '#1e1e1e',
                marginBottom: '1rem',
                borderRadius: '2px',
              }}
            />
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          <div>
            <div
              style={{
                height: '20px',
                width: '140px',
                background: '#1e1e1e',
                marginBottom: '1rem',
                borderRadius: '2px',
              }}
            />
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : (
        // Loaded UI: show upcoming fixtures + recent results
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          {/* Upcoming fixtures */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#888',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                Upcoming Fixtures
              </h2>
              <Link to="/standings" style={{ fontSize: '0.8rem', color: '#555' }}>
                View all →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {upcoming.map((match) => (
                <div
                  key={match.id}
                  style={{
                    background: '#161616',
                    border: '1px solid #2a2a2a',
                    borderRadius: '4px',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.15s',
                  }}
                  // Simple hover effect
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3a3a3a')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.2rem',
                      }}
                    >
                      {match.home_team}
                      <span style={{ color: '#555', margin: '0 0.4rem', fontWeight: 400 }}>
                        vs
                      </span>
                      {match.away_team}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#555' }}>{match.league}</p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatDate(match.date)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#555' }}>{match.time} UTC</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent results */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#888',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                Recent Results
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recent.map((match) => (
                <div
                  key={match.id}
                  style={{
                    background: '#161616',
                    border: '1px solid #2a2a2a',
                    borderRadius: '4px',
                    padding: '0.875rem 1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3a3a3a')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{match.home_team}</p>

                  <div style={{ textAlign: 'center' }}>
                    <p
                      style={{
                        fontFamily: 'Bebas Neue',
                        fontSize: '1.1rem',
                        letterSpacing: '2px',
                        color: '#f0f0f0',
                      }}
                    >
                      {match.home_score} – {match.away_score}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#555' }}>
                      {formatDate(match.date)}
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textAlign: 'right',
                    }}
                  >
                    {match.away_team}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
