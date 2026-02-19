import { useEffect, useState } from 'react'
import axios from 'axios'
import useStore from '../store'
import { SkeletonTeamCard } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { API_URL } from '../config'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState('')
  const [loading, setLoading] = useState(true)
  const [favouriting, setFavouriting] = useState(null)
  const { token } = useStore()
  const { addToast } = useToast()

  useEffect(() => {
    axios.get(`${API_URL}/api/teams/`)
      .then((res) => { setTeams(res.data.teams); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesLeague = league === '' || t.league === league
    return matchesSearch && matchesLeague
  })

  const addFavourite = async (team) => {
    if (!token) { window.location.href = '/login'; return }
    setFavouriting(team.id)
    try {
      await axios.post(
        `${API_URL}/api/favourites/`,
        { team_id: team.id, team_name: team.name, team_crest: team.crest, team_league: team.league },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      addToast(`${team.name} added to favourites!`)
    } catch (err) {
      if (err.response?.status === 400) addToast('Already in favourites!', 'warning')
      else { addToast('Please login to save favourites', 'error'); window.location.href = '/login' }
    }
    setFavouriting(null)
  }

  const LEAGUES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1']

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Teams</h1>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>Top 5 European Leagues</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0',
            padding: '0.5rem 0.875rem', fontSize: '0.875rem',
            borderRadius: '4px', outline: 'none', width: '220px',
          }}
        />

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button onClick={() => setLeague('')} style={{
            background: league === '' ? '#2a2a2a' : 'transparent',
            color: league === '' ? '#f0f0f0' : '#555',
            border: '1px solid', borderColor: league === '' ? '#3a3a3a' : '#2a2a2a',
            padding: '0.35rem 0.75rem', fontSize: '0.8rem',
            borderRadius: '100px', cursor: 'pointer', transition: 'all 0.15s',
          }}>All</button>

          {LEAGUES.map((l) => (
            <button key={l} onClick={() => setLeague(l)} style={{
              background: league === l ? '#2a2a2a' : 'transparent',
              color: league === l ? '#f0f0f0' : '#555',
              border: '1px solid', borderColor: league === l ? '#3a3a3a' : '#2a2a2a',
              padding: '0.35rem 0.75rem', fontSize: '0.8rem',
              borderRadius: '100px', cursor: 'pointer', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>

        {!loading && (
          <span style={{ color: '#555', fontSize: '0.8rem', marginLeft: 'auto' }}>
            {filtered.length} teams
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[...Array(12)].map((_, i) => <SkeletonTeamCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {filtered.map((team) => (
            <div key={team.id} style={{
              background: '#161616', border: '1px solid #2a2a2a', borderRadius: '6px',
              padding: '1.25rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.875rem',
              transition: 'border-color 0.15s, background 0.15s', cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.background = '#1a1a1a' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#161616' }}
            >
              {team.crest ? (
                <img src={team.crest} alt={team.name} style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', background: '#1e1e1e', borderRadius: '50%' }} />
              )}

              <div style={{ textAlign: 'center', width: '100%' }}>
                <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', color: '#f0f0f0' }}>
                  {team.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#555' }}>{team.league}</p>
                {team.venue && (
                  <p style={{ fontSize: '0.75rem', color: '#444', marginTop: '0.15rem' }}>{team.venue}</p>
                )}
              </div>

              <button
                onClick={() => addFavourite(team)}
                disabled={favouriting === team.id}
                style={{
                  background: 'transparent', border: '1px solid #2a2a2a',
                  color: '#555', padding: '0.35rem 0', fontSize: '0.8rem',
                  cursor: 'pointer', width: '100%', borderRadius: '4px', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00ff87'; e.currentTarget.style.color = '#00ff87' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555' }}
              >
                {favouriting === team.id ? 'Adding...' : '♡ Favourite'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}