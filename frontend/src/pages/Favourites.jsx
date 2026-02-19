import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import useStore from '../store'
import { API_URL } from '../config'

export default function Favourites() {
  // List of favourited teams for the current user
  const [favourites, setFavourites] = useState([])

  // Simple loading state while fetching from the backend
  const [loading, setLoading] = useState(true)

  // Auth state (stored globally in Zustand + localStorage)
  const { token, user } = useStore()

  // Fetch favourites once we have a token (i.e., user is logged in)
  useEffect(() => {
    // If user isn't logged in, don't call the protected endpoint
    if (!token) return

    axios
      .get(`${API_URL}/api/favourites/`, {
        // Bearer token required by backend auth dependency
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFavourites(res.data.favourites)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  // Remove a favourite team for the logged-in user
  const removeFavourite = async (teamId) => {
    try {
      await axios.delete(`${API_URL}/api/favourites/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Optimistic UI update: remove from state without needing a refetch
      setFavourites((prev) => prev.filter((f) => f.team_id !== teamId))
    } catch (err) {
      console.error(err)
    }
  }

  // If there's no user in state, show a login prompt instead of the favourites page
  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '5rem auto', padding: '0 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', marginBottom: '1rem' }}>
          FAVOURITES
        </h1>

        <p style={{ color: '#888', marginBottom: '2rem' }}>
          You need to be logged in to save favourite teams.
        </p>

        <Link
          to="/login"
          style={{
            background: '#00ff87',
            color: '#000',
            padding: '0.75rem 2rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '1px',
          }}
        >
          LOGIN →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'Bebas Neue',
          fontSize: '3rem',
          letterSpacing: '2px',
          marginBottom: '0.5rem',
        }}
      >
        FAVOURITES
      </h1>

      {/* Greeting */}
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Welcome back, <span style={{ color: '#00ff87' }}>{user.username}</span>
      </p>

      {/* Content states */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : favourites.length === 0 ? (
        // Empty state (user has no favourites yet)
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#888', marginBottom: '1rem' }}>No favourite teams yet.</p>

          <Link
            to="/teams"
            style={{
              background: '#00ff87',
              color: '#000',
              padding: '0.75rem 2rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '1px',
            }}
          >
            BROWSE TEAMS →
          </Link>
        </div>
      ) : (
        // Favourites grid
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {favourites.map((fav) => (
            <div
              key={fav.id}
              style={{
                background: '#111',
                border: '1px solid #222',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* Team crest/logo */}
              {fav.team_crest && (
                <img
                  src={fav.team_crest}
                  alt={fav.team_name}
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              )}

              {/* Team info */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{fav.team_name}</h3>
                <p style={{ color: '#00ff87', fontSize: '0.8rem', fontWeight: 600 }}>{fav.team_league}</p>
              </div>

              {/* Remove favourite */}
              <button
                onClick={() => removeFavourite(fav.team_id)}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
