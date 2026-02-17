export default function HowItWorks() {

  const features = [
    { name: 'Recent Home Goals', importance: 0.142, desc: 'Avg goals scored at home in last 5 games' },
    { name: 'H2H Home Goals', importance: 0.128, desc: 'Weighted goals scored in last 5 H2H meetings' },
    { name: 'Home Advantage', importance: 0.118, desc: 'Home form vs away form differential' },
    { name: 'Away Recent Goals', importance: 0.112, desc: 'Avg goals scored away in last 5 games' },
    { name: 'Home Form', importance: 0.098, desc: 'Goals scored minus goals conceded (home)' },
    { name: 'H2H Away Goals', importance: 0.091, desc: 'Weighted away goals in H2H meetings' },
    { name: 'Away Form', importance: 0.087, desc: 'Goals scored minus goals conceded (away)' },
    { name: 'Home Recent Conceded', importance: 0.076, desc: 'Avg goals conceded at home in last 5' },
    { name: 'H2H Home Conceded', importance: 0.065, desc: 'Weighted goals conceded in H2H' },
    { name: 'Away Recent Conceded', importance: 0.054, desc: 'Avg goals conceded away in last 5' },
    { name: 'H2H Away Conceded', importance: 0.029, desc: 'Weighted away goals conceded in H2H' },
  ]

  const maxImportance = Math.max(...features.map(f => f.importance))

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>

      {/* Header */}
      <p style={{ color: '#00ff87', fontWeight: 600, letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '1rem' }}>
        METHODOLOGY
      </p>
      <h1 style={{
        fontFamily: 'Bebas Neue', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        letterSpacing: '2px', marginBottom: '1rem', lineHeight: 1
      }}>
        HOW THE<br />
        <span style={{ color: '#00ff87' }}>PREDICTIONS</span><br />
        WORK
      </h1>
      <p style={{ color: '#888', maxWidth: '600px', marginBottom: '4rem', lineHeight: 1.7 }}>
        KickStats uses a Random Forest machine learning model trained on 3 seasons
        of match data across Europe's top 5 leagues. Here's exactly how it works.
      </p>

      {/* Pipeline */}
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
        THE PIPELINE
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1px', background: '#222', marginBottom: '4rem'
      }}>
        {[
          { step: '01', title: 'Data Collection', desc: '3 seasons of match results across 5 leagues. 4,500+ matches.' },
          { step: '02', title: 'Feature Engineering', desc: '11 features calculated per match including form, H2H, and home advantage.' },
          { step: '03', title: 'Model Training', desc: 'Random Forest with GridSearchCV hyperparameter tuning and TimeSeriesSplit.' },
          { step: '04', title: 'Prediction', desc: 'Model outputs Win/Draw/Loss probabilities for any two teams.' },
        ].map(({ step, title, desc }) => (
          <div key={step} style={{ background: '#0a0a0a', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#00ff87', marginBottom: '0.5rem' }}>
              {step}
            </p>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{title}</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Feature importance */}
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
        WHAT DRIVES PREDICTIONS
      </h2>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Feature importance from the trained Random Forest model
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '4rem' }}>
        {features.map(f => (
          <div key={f.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{f.name}</span>
                <span style={{ color: '#555', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{f.desc}</span>
              </div>
              <span style={{ color: '#00ff87', fontWeight: 700, fontSize: '0.85rem' }}>
                {(f.importance * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ background: '#111', height: '6px' }}>
              <div style={{
                background: '#00ff87',
                height: '100%',
                width: `${(f.importance / maxImportance) * 100}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Model performance */}
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
        MODEL PERFORMANCE
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '4rem'
      }}>
        {[
          { label: 'Model Accuracy', value: '68%', sub: 'On unseen test data', color: '#00ff87' },
          { label: 'vs Always Home', value: '+23pp', sub: 'Baseline: 45% accuracy', color: '#00ff87' },
          { label: 'vs Random Guess', value: '+35pp', sub: 'Baseline: 33% accuracy', color: '#00ff87' },
          { label: 'Training Data', value: '4,500+', sub: 'Matches across 5 leagues', color: '#fff' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{
            background: '#111', border: '1px solid #222',
            padding: '1.5rem', textAlign: 'center'
          }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color, marginBottom: '0.25rem' }}>
              {value}
            </p>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</p>
            <p style={{ color: '#555', fontSize: '0.8rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Limitations */}
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
        KNOWN LIMITATIONS
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '4rem' }}>
        {[
          { issue: 'Draws are hard to predict', detail: 'The model has ~9% recall on draws. Draws are inherently unpredictable due to late game events like injuries and red cards.' },
          { issue: 'Injuries not factored in', detail: 'Squad availability, key player injuries and suspensions are not currently included as features.' },
          { issue: 'Tactical changes ignored', detail: 'Manager decisions, formation changes, and rotation policies are not captured in the data.' },
          { issue: 'Based on recent history', detail: 'Newly promoted teams or teams mid-rebuild have limited historical data, reducing prediction reliability.' },
        ].map(({ issue, detail }) => (
          <div key={issue} style={{
            background: '#111', border: '1px solid #222',
            padding: '1rem 1.5rem', display: 'flex', gap: '1rem'
          }}>
            <span style={{ color: '#ff4444', fontSize: '1.2rem', flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{issue}</p>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
        TECH STACK
      </h2>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem'
      }}>
        {[
          'Python', 'Scikit-Learn', 'Random Forest', 'GridSearchCV',
          'TimeSeriesSplit', 'Pandas', 'NumPy', 'FastAPI', 'React', 'PostgreSQL'
        ].map(tech => (
          <span key={tech} style={{
            background: '#111', border: '1px solid #222',
            padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#888'
          }}>
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}