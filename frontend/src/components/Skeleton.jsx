// Skeleton loading components
// Used as visual placeholders while data is being fetched

export function SkeletonCard() {
  return (
    <>
      {/* Shimmer animation definition */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Card-style skeleton (used for lists like matches or standings) */}
      <div
        style={{
          background: '#111',
          border: '1px solid #1a1a1a',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        {/* Left-side text placeholders */}
        <div>
          {/* Title placeholder */}
          <div
            style={{
              height: '14px',
              width: '180px',
              background:
                'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              marginBottom: '0.5rem',
            }}
          />

          {/* Subtitle placeholder */}
          <div
            style={{
              height: '10px',
              width: '100px',
              background:
                'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>

        {/* Right-side placeholder (e.g. score, status, or action) */}
        <div
          style={{
            height: '14px',
            width: '60px',
            background:
              'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
    </>
  )
}

export function SkeletonTeamCard() {
  return (
    <>
      {/* Shimmer animation definition (scoped to this component) */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Team card skeleton (used for team grid views) */}
      <div
        style={{
          background: '#111',
          border: '1px solid #1a1a1a',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Team crest placeholder */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background:
              'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />

        {/* Team name placeholder */}
        <div
          style={{
            height: '14px',
            width: '120px',
            background:
              'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />

        {/* Team metadata placeholder */}
        <div
          style={{
            height: '10px',
            width: '80px',
            background:
              'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
    </>
  )
}
