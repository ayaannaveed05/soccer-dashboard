import { useState } from 'react'
import axios from 'axios'

export default function Predict() {
  const [homeTeam, setHomeTeam] = useState('')  // Home team input
  const [awayTeam, setAwayTeam] = useState('')  // Away team input
  const [result, setResult] = useState(null)  // Prediction result
  const [loading, setLoading] = useState(false)  // Loading state

  // Send prediction request to backend
  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) return

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/predictions/predict', {
        home_team: homeTeam,
        away_team: awayTeam,
      })
      setResult(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{
        fontFamily: 'Bebas Neue',
        fontSize: '3rem',
        letterSpacing: '2px',
        marginBottom: '0.5rem',
      }}>
        PREDICT A MATCH
      </h1>
      <p style={{ color: '#888', marginBottom: '3rem' }}>
        Enter two teams to get an ML-powered prediction
      </p>

      {/* Input form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
            HOME TEAM
          </label>
          <input
            type="text"
            placeholder="e.g. Arsenal"
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            style={{
              background: '#111',
              border: '1px solid #222',
              color: '#fff',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '2px', display: 'block', marginBottom: '0.5rem' }}>
            AWAY TEAM
          </label>
          <input
            type="text"
            placeholder="e.g. Chelsea"
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            style={{
              background: '#111',
              border: '1px solid #222',
              color: '#fff',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading || !homeTeam || !awayTeam}
          style={{
            background: homeTeam && awayTeam ? '#00ff87' : '#222',
            color: homeTeam && awayTeam ? '#000' : '#888',
            border: 'none',
            padding: '0.75rem 2rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '1px',
            cursor: homeTeam && awayTeam ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'PREDICTING...' : 'PREDICT →'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{
          background: '#111',
          border: '1px solid #00ff87',
          padding: '2rem',
        }}>
          <p style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1rem' }}>
            PREDICTION RESULT
          </p>

          {/* Match */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.home_team}</span>
            <span style={{ color: '#00ff87', fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>VS</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.away_team}</span>
          </div>

          {/* Winner */}
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#00ff87', marginBottom: '2rem' }}>
            {result.prediction}
          </p>

          {/* Probabilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Home Win', value: result.probabilities.home_win },
              { label: 'Draw', value: result.probabilities.draw },
              { label: 'Away Win', value: result.probabilities.away_win },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{(value * 100).toFixed(0)}%</span>
                </div>
                {/* Probability bar */}
                <div style={{ background: '#222', height: '4px' }}>
                  <div style={{
                    background: '#00ff87',
                    height: '100%',
                    width: `${value * 100}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}