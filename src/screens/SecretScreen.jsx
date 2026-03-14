import { useState } from 'react'
import { isValidNumber } from '../hooks/gameLogic.js'
import { joinGame } from '../firebase/gameService.js'

export default function SecretScreen({ navigate, goBack, config, setPlayerSecret, setGameId, setRole, className }) {
  const [digits, setDigits] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const digitCount = config.digits

  const handleKey = (key) => {
    if (key === 'del') {
      setDigits(d => d.slice(0, -1))
    } else if (digits.length < digitCount) {
      // Prevent duplicate digits
      if (!digits.includes(key)) {
        setDigits(d => [...d, key])
      }
    }
  }

  const isComplete = digits.length === digitCount
  const secret = digits.join('')

  const isJoining = !!config.joinCode

  const handleConfirm = async () => {
    if (!isComplete || !isValidNumber(secret, digitCount)) return
    setPlayerSecret(secret)
    setError(null)

    if (isJoining) {
      // Joiner: call joinGame to validate code and join
      setLoading(true)
      try {
        const { gameId, role } = await joinGame(config.joinCode, secret)
        setGameId(gameId)
        setRole(role)
        navigate('game')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Creator: go to invite screen to create game
      navigate('invite')
    }
  }

  return (
    <div className={`screen-container ${className || ''}`}>
      <div className="status-bar-mini">
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      <button className="nav-back" onClick={goBack}>← Retour</button>
      <div className="section-title">Votre nombre secret</div>
      {isJoining && (
        <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 12, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--accent)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
          🔗 Rejoindre · Code : {config.joinCode}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#ff5050' }}>
          {error}
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
        Entrez un nombre à {digitCount} chiffres uniques.<br />
        {isJoining ? "L'adversaire devra le deviner." : 'Votre adversaire devra le deviner.'}
      </p>

      <div className="digit-inputs">
        {Array.from({ length: digitCount }).map((_, i) => {
          const isFilled = i < digits.length
          const isActive = i === digits.length
          return (
            <div
              key={i}
              className={`digit-input ${isFilled ? 'filled' : ''} ${isActive ? 'active' : ''}`}
            >
              {isFilled ? digits[i] : isActive ? <div className="cursor" /> : null}
            </div>
          )
        })}
      </div>

      <div className="keypad">
        {['1','2','3','4','5','6','7','8','9'].map(k => (
          <button key={k} className="key" onClick={() => handleKey(k)}>{k}</button>
        ))}
        <button className="key delete" onClick={() => handleKey('del')}>⌫</button>
        <button className="key zero" onClick={() => handleKey('0')}>0</button>
        <button className="key invisible" disabled />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={!isComplete || loading}
      >
        {loading ? 'Connexion...' : 'Confirmer'}
      </button>
    </div>
  )
}
