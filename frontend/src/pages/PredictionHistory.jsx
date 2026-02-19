import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'
import useStore from '../store'

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([])
  const [stats, setStats] = useState({ total: 0, correct: 0, pending: 0, accuracy: 0 })
  const [loading, setLoading] = useState(true)
  const { token, user } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    axios.get(`${API_URL}/api/prediction-history/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPredictions(res.data.predictions)
        setStats(res.data.stats)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [token, navigate])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getOutcomeColor = (wasCorrect) => {
    if (wasCorrect === null) return '#555'
    return wasCorrect ? '#00ff87' : '#ff4444'
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Prediction History
        </h1>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          Track your accuracy vs the model
        </p>
      </div>

      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Predictions', value: stats.total },
          { label: 'Correct', value: stats.correct },
          { label: 'Pending', value: stats.pending },
          { label: 'Accuracy', value: `${stats.accuracy}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: 'Bebas Neue',
              fontSize: '1.8rem',
              color: '#f0f0f0',
              lineHeight: 1,
              marginBottom: '0.25rem'
            }}>
              {value}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#555' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Predictions list */}
      {loading ? (
        <p style={{ color: '#555', fontSize: '0.875rem' }}>Loading...</p>
      ) : predictions.length === 0 ? (
        <div style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#888', marginBottom: '1rem' }}>No predictions yet</p>
          <a href="/predict" style={{
            background: '#00ff87',
            color: '#000',
            padding: '0.6rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '4px'
          }}>
            Make your first prediction
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {predictions.map(p => (
            <div key={p.id} style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              
              {/* Match */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {p.home_team} <span style={{ color: '#555', fontWeight: 400 }}>vs</span> {p.away_team}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#555' }}>{formatDate(p.created_at)}</p>
              </div>

              {/* Prediction */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.25rem' }}>
                  Your pick
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {p.predicted_outcome}
                </p>
              </div>

              {/* Result */}
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.25rem' }}>
                  Result
                </p>
                {p.was_correct === null ? (
                  <span style={{
                    background: '#2a2a2a',
                    color: '#888',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Pending
                  </span>
                ) : (
                  <span style={{
                    background: getOutcomeColor(p.was_correct) + '20',
                    color: getOutcomeColor(p.was_correct),
                    border: `1px solid ${getOutcomeColor(p.was_correct)}40`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {p.was_correct ? '✓ Correct' : '✗ Wrong'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}