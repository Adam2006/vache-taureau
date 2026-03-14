import { useState, useEffect } from 'react'
import { createGame, listenToGame } from '../firebase/gameService.js'

export default function InviteScreen({ navigate, goBack, config, playerSecret, setGameId, setRole, className }) {
  const [code, setCode] = useState('......')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubscribe = null

    async function init() {
      try {
        const { gameId, code: gameCode } = await createGame(config, playerSecret)
        setCode(gameCode)
        setGameId(gameId)
        setRole('creator')

        // Listen for opponent joining (status changes to "playing")
        unsubscribe = listenToGame(gameId, (game) => {
          if (game.status === 'playing') {
            navigate('game')
          }
        })
      } catch (err) {
        setError(err.message)
      }
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, []) // eslint-disable-line

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vache-Taureau',
        text: `Rejoins ma partie ! Code : ${code}`,
        url: window.location.href,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className={`screen-container ${className || ''}`}>
      <div className="status-bar-mini">
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      <button className="nav-back" onClick={goBack}>← Retour</button>
      <div className="section-title">Inviter un ami</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
        Partagez ce code avec votre adversaire pour démarrer la partie.
      </p>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ff5050' }}>
          {error}
        </div>
      )}

      <div style={{
        background: 'var(--surface2)',
        border: '2px solid var(--accent)',
        borderRadius: 20,
        padding: '28px',
        textAlign: 'center',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          Code d'invitation
        </div>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: '0.25em',
          color: 'var(--accent)',
        }}>{code}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
          {config.digits} chiffres · {config.timeLimit}min par tour
        </div>
      </div>

      <button className="btn btn-secondary" style={{ marginBottom: 10 }} onClick={handleCopy}>
        {copied ? '✅ Copié !' : '📋 Copier le code'}
      </button>
      <button className="btn btn-ghost" style={{ marginBottom: 28 }} onClick={handleShare}>
        📤 Partager via...
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
        <div className="dot-pulse">
          <span /><span /><span />
        </div>
        En attente de l'adversaire
      </div>

      <button className="btn btn-danger" style={{ marginTop: 'auto' }} onClick={goBack}>
        Annuler
      </button>
    </div>
  )
}
