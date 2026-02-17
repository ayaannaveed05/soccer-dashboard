import { useEffect, useState } from 'react'
import axios from 'axios'

// Supported competitions for tabs (football-data.org league codes)
const LEAGUES = [
  { code: 'PL', name: 'Premier League', short: 'EPL' },
  { code: 'PD', name: 'La Liga', short: 'LAL' },
  { code: 'BL1', name: 'Bundesliga', short: 'BUN' },
  { code: 'SA', name: 'Serie A', short: 'SA' },
  { code: 'FL1', name: 'Ligue 1', short: 'L1' },
  { code: 'CL', name: 'Champions League', short: 'UCL' },
]

export default function Standings() {
  // Selected league code (default to Premier League)
  const [league, setLeague] = useState('PL')

  // League standings table rows (non-UCL)
  const [standings, setStandings] = useState([])

  // UCL standings are returned as grouped tables
  const [groups, setGroups] = useState([])

  // Competition name returned from backend (stored for potential display)
  const [leagueName, setLeagueName] = useState('')

  // Loading state
  const [loading, setLoading] = useState(true)

  // Fetch standings whenever the selected league changes
  useEffect(() => {
    setLoading(true)

    axios
      .get(`http://localhost:8000/api/matches/standings/${league}`)
      .then((res) => {
        // Backend returns:
        // - standings (array) for most leagues
        // - groups (array) for Champions League
        setStandings(res.data.standings)
        setGroups(res.data.groups || [])
        setLeagueName(res.data.league)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [league])

  // Reusable table renderer (used for league tables and UCL group tables)
  const renderTable = (rows, showLegend) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
            {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '0.6rem 0.75rem',
                  textAlign: i <= 1 ? 'left' : 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: h === 'Pts' ? '#00ff87' : '#555',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            // League-only legend markers:
            // - Top 4: Champions League
            // - 5-6: Europa League
            // - Bottom 3: relegation
            const isTop4 = showLegend && row.position <= 4
            const isEuropa = showLegend && row.position > 4 && row.position <= 6
            const isRelegation = showLegend && row.position >= rows.length - 2

            return (
              <tr
                key={row.position}
                style={{
                  borderBottom: '1px solid #1e1e1e',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Position + optional legend bar */}
                <td style={{ padding: '0.7rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {showLegend && (
                      <div
                        style={{
                          width: '3px',
                          height: '16px',
                          borderRadius: '2px',
                          background: isTop4
                            ? '#00ff87'
                            : isEuropa
                            ? '#ff8c00'
                            : isRelegation
                            ? '#ff4444'
                            : 'transparent',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ color: '#555', fontWeight: 500, fontSize: '0.8rem' }}>
                      {row.position}
                    </span>
                  </div>
                </td>

                {/* Team name + crest */}
                <td style={{ padding: '0.7rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {row.crest && (
                      <img
                        src={row.crest}
                        alt={row.team}
                        style={{
                          width: '20px',
                          height: '20px',
                          objectFit: 'contain',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.team}</span>
                  </div>
                </td>

                {/* Stats columns */}
                {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga].map((val, idx) => (
                  <td key={idx} style={{ padding: '0.7rem 0.75rem', textAlign: 'center', color: '#888' }}>
                    {val}
                  </td>
                ))}

                {/* Goal difference with positive/negative coloring */}
                <td
                  style={{
                    padding: '0.7rem 0.75rem',
                    textAlign: 'center',
                    color: row.gd > 0 ? '#00ff87' : row.gd < 0 ? '#ff4444' : '#888',
                    fontWeight: 500,
                  }}
                >
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>

                {/* Points (emphasized) */}
                <td
                  style={{
                    padding: '0.7rem 0.75rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#f0f0f0',
                  }}
                >
                  {row.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend (only shown for league tables, not UCL groups) */}
      {showLegend && (
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', padding: '0 0.75rem' }}>
          {[
            { color: '#00ff87', label: 'Champions League' },
            { color: '#ff8c00', label: 'Europa League' },
            { color: '#ff4444', label: 'Relegation' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '3px', height: '14px', background: color, borderRadius: '2px' }} />
              <span style={{ color: '#555', fontSize: '0.75rem' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Standings</h1>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>2025/26 Season</p>
      </div>

      {/* League tabs */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '1.5rem',
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          padding: '4px',
          width: 'fit-content',
        }}
      >
        {LEAGUES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLeague(l.code)}
            style={{
              background: league === l.code ? '#2a2a2a' : 'transparent',
              color: league === l.code ? '#f0f0f0' : '#555',
              border: 'none',
              padding: '0.4rem 0.875rem',
              fontSize: '0.8rem',
              fontWeight: league === l.code ? 600 : 400,
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Standings container */}
      <div
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          // Loading state
          <div style={{ padding: '2rem', color: '#555', fontSize: '0.875rem' }}>
            Loading standings...
          </div>
        ) : groups.length > 0 ? (
          // Champions League: render group tables
          <div style={{ padding: '1rem' }}>
            {groups.map((group) => (
              <div key={group.group} style={{ marginBottom: '2rem' }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#555',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {group.group?.replace('GROUP_', 'Group ')}
                </p>
                {renderTable(group.table, false)}
              </div>
            ))}
          </div>
        ) : (
          // Standard league: single standings table + legend
          renderTable(standings, true)
        )}
      </div>
    </div>
  )
}
