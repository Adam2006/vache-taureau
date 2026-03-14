export default function WinScreen({ navigate, config, gameResult, playerSecret, className }) {
  const result = gameResult || {}
  const playerWon = result.winner === 'player'
  const guessCount = playerWon
    ? result.playerGuesses?.length
    : result.aiGuesses?.length
  const secret = result.aiSecret || '????'

  return (
    <div className={`screen-container ${className || ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="status-bar-mini" style={{ width: '100%', marginBottom: 20 }}>
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 72, display: 'block', marginBottom: 16, animation: playerWon ? 'bounce 0.6s ease infinite alternate' : 'none' }}>
          {playerWon ? '🏆' : '😅'}
        </span>

        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 8 }}>
          {playerWon ? 'Bravo !' : 'Perdu !'}
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
          {playerWon ? 'Vous avez deviné le nombre secret' : "L'adversaire a deviné votre nombre secret"}
        </p>

        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: '0.2em',
          margin: '12px 0 16px',
        }}>
          {secret.split('').join(' ')}
        </div>

        <div style={{
          display: 'inline-block',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '8px 16px',
          fontSize: 13,
          color: 'var(--accent)',
          marginBottom: 16,
        }}>
          {playerWon ? '✅' : '❌'} Résolu en {guessCount} essai{guessCount > 1 ? 's' : ''}
        </div>

        {playerWon && config.mode === 'ai' && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>
            L'IA a tenté {result.aiGuesses?.length || 0} fois 😈
          </p>
        )}

        {!playerWon && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>
            Votre nombre était <span style={{ color: 'var(--cow)', fontWeight: 700 }}>{playerSecret?.split('').join(' ')}</span>
          </p>
        )}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary" onClick={() => navigate('setup')}>🎮 Rejouer</button>
        <button className="btn btn-ghost" onClick={() => navigate('home')}>Retour à l'accueil</button>
      </div>
    </div>
  )
}
