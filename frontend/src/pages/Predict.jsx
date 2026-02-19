import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

// Reusable team autocomplete input
function TeamInput({ label, value, onChange, teams }) {
  // Controls suggestion dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false)

  // Used to detect clicks outside the input + dropdown
  const ref = useRef(null)

  // Filter team list based on current input (case-insensitive), limit to 6 suggestions
  const filtered = teams
    .filter((t) => t.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 6)

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Field label */}
      <label
        style={{
          color: '#555',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </label>

      {/* Text input */}
      <input
        type="text"
        placeholder={label === 'Home team' ? 'e.g. Arsenal' : 'e.g. Chelsea'}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          color: '#f0f0f0',
          padding: '0.6rem 0.875rem',
          fontSize: '0.9rem',
          width: '100%',
          outline: 'none',
          borderRadius: '4px',
          transition: 'border-color 0.15s',
        }}
        // Simple focus styling via inline events
        onFocusCapture={(e) => (e.target.style.borderColor = '#3a3a3a')}
        onBlurCapture={(e) => (e.target.style.borderColor = '#2a2a2a')}
      />

      {/* Suggestions dropdown */}
      {showDropdown && value.length > 0 && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            borderRadius: '4px',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {filtered.map((team) => (
            <div
              key={team}
              // Select suggestion
              onClick={() => {
                onChange(team)
                setShowDropdown(false)
              }}
              style={{
                padding: '0.6rem 0.875rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#888',
                borderBottom: '1px solid #2a2a2a',
                transition: 'all 0.1s',
              }}
              // Hover styling
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a'
                e.currentTarget.style.color = '#f0f0f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#888'
              }}
            >
              {team}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Predict() {
  // User selections
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')

  // API results
  const [result, setResult] = useState(null)
  const [h2h, setH2h] = useState([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')

  // Fetch list of valid teams for autocomplete (from model dataset)
  useEffect(() => {
    axios.get('${API_URL}/api/predictions/teams').then((res) => setTeams(res.data.teams))
  }, [])

  // Main prediction handler:
  // - calls prediction endpoint + H2H endpoint in parallel
  // - updates UI with prediction, probabilities, and history
  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) return

    setLoading(true)
    setResult(null)
    setH2h([])
    setError('')

    try {
      const [predRes, h2hRes] = await Promise.all([
        axios.post('http://localhost:8000/api/predictions/predict', {
          home_team: homeTeam,
          away_team: awayTeam,
        }),
        axios.get('http://localhost:8000/api/predictions/h2h', {
          params: { home_team: homeTeam, away_team: awayTeam },
        }),
      ])

      // Backend may return an "error" field for unsupported inputs (e.g. cross-league)
      if (predRes.data.error) setError(predRes.data.error)
      else {
        setResult(predRes.data)
        setH2h(h2hRes.data.matches)
      }
    } catch {
      // General fallback error message
      setError('Team not found. Please select a team from the suggestions.')
    }

    setLoading(false)
  }

  // Color mapping for H2H result badge (W/L/D)
  const resultBadgeColor = (r) => (r === 'W' ? '#00ff87' : r === 'L' ? '#ff4444' : '#555')

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Match Predictor
        </h1>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          ML-powered predictions using 3 seasons of match data
        </p>
      </div>

      {/* Input card */}
      <div
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        {/* Team selectors */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '1rem',
          }}
        >
          <TeamInput label="Home team" value={homeTeam} onChange={setHomeTeam} teams={teams} />

          <div
            style={{
              padding: '0.6rem 0.5rem',
              color: '#555',
              fontSize: '0.8rem',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '0px',
            }}
          >
            vs
          </div>

          <TeamInput label="Away team" value={awayTeam} onChange={setAwayTeam} teams={teams} />
        </div>

        {/* Predict button */}
        <button
          onClick={handlePredict}
          disabled={loading || !homeTeam || !awayTeam}
          style={{
            background: homeTeam && awayTeam ? '#00ff87' : '#1e1e1e',
            color: homeTeam && awayTeam ? '#000' : '#444',
            border: 'none',
            padding: '0.65rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: homeTeam && awayTeam ? 'pointer' : 'not-allowed',
            width: '100%',
            borderRadius: '4px',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Analyzing...' : 'Predict match →'}
        </button>

        {/* Error message */}
        {error && (
          <p
            style={{
              color: '#ff4444',
              fontSize: '0.85rem',
              marginTop: '0.75rem',
              padding: '0.6rem 0.875rem',
              background: '#ff444410',
              border: '1px solid #ff444430',
              borderRadius: '4px',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Prediction result card */}
      {result && (
        <div
          style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#555',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Prediction
          </p>

          {/* Teams summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{result.home_team}</p>
              <p style={{ color: '#555', fontSize: '0.75rem' }}>Home</p>
            </div>
            <span style={{ color: '#555', fontSize: '0.85rem', fontWeight: 600 }}>vs</span>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{result.away_team}</p>
              <p style={{ color: '#555', fontSize: '0.75rem' }}>Away</p>
            </div>
          </div>

          {/* Prediction badge + confidence */}
          <div
            style={{
              background: '#00ff8715',
              border: '1px solid #00ff8730',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: '#00ff87', fontWeight: 700, fontSize: '1rem' }}>
              {result.prediction}
            </span>
            <span style={{ color: '#555', fontSize: '0.8rem' }}>{result.confidence}% confidence</span>
          </div>

          {/* Probability bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Home win', value: result.probabilities.home_win },
              { label: 'Draw', value: result.probabilities.draw },
              { label: 'Away win', value: result.probabilities.away_win },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{label}</span>
                  <span style={{ color: '#f0f0f0', fontSize: '0.8rem', fontWeight: 600 }}>
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>

                <div style={{ background: '#1e1e1e', height: '3px', borderRadius: '2px' }}>
                  <div
                    style={{
                      background: '#00ff87',
                      height: '100%',
                      borderRadius: '2px',
                      width: `${value * 100}%`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Head-to-head card */}
      {h2h.length > 0 && (
        <div
          style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            padding: '1.5rem',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#555',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Head to Head — last {h2h.length} meetings
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {h2h.map((match, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto 1fr auto',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  background: i % 2 === 0 ? 'transparent' : '#1a1a1a',
                  borderRadius: '3px',
                }}
              >
                <span style={{ color: '#444', fontSize: '0.75rem' }}>{match.date}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, textAlign: 'right' }}>
                  {match.home_team}
                </span>

                <span
                  style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: '1rem',
                    letterSpacing: '2px',
                    color: '#f0f0f0',
                    minWidth: '50px',
                    textAlign: 'center',
                  }}
                >
                  {match.home_goals} – {match.away_goals}
                </span>

                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{match.away_team}</span>

                <span
                  style={{
                    background: resultBadgeColor(match.result) + '20',
                    color: resultBadgeColor(match.result),
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                    border: `1px solid ${resultBadgeColor(match.result)}40`,
                  }}
                >
                  {match.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No H2H fallback */}
      {result && h2h.length === 0 && (
        <div
          style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            padding: '1.5rem',
          }}
        >
          <p style={{ color: '#444', fontSize: '0.85rem' }}>
            No head-to-head data available. These teams may be from different leagues or haven't met in our
            dataset (2023–2026).
          </p>
        </div>
      )}
    </div>
  )
}
