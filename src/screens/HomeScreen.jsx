import { useState } from 'react'
import styles from './HomeScreen.module.css'

export default function HomeScreen({ navigate, setConfig, className }) {
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')

  const handleCodeInput = (e) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
  }

  const handleJoin = () => {
    if (code.length === 6) {
      // Will be wired to Firebase later — navigate to secret screen (joiner also picks their number)
      setConfig(c => ({ ...c, mode: 'human', joinCode: code }))
      navigate('secret')
    }
  }

  const handleNew = () => {
    setConfig(c => ({ ...c, mode: 'human', joinCode: null }))
    navigate('setup')
  }

  return (
    <div className={`${styles.screen} ${className || ''}`}>
      <div className={styles.statusBar}>
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      <div className={styles.logoArea}>
        <span className={styles.emojiLogo}>🐄🐂</span>
        <h1 className={styles.title}>Vache<span className={styles.dash}>–</span>Taureau</h1>
        <p className={styles.tagline}>devine le nombre secret</p>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={handleNew}>
          🎮 Nouvelle Partie
        </button>

        {!joining ? (
          <button className="btn btn-secondary" onClick={() => setJoining(true)}>
            🔗 Rejoindre une partie
          </button>
        ) : (
          <div className={styles.joinBox}>
            <p className={styles.joinLabel}>Code d'invitation (6 caractères)</p>
            <input
              className={styles.codeInput}
              type="text"
              inputMode="text"
              placeholder="X7K2PQ"
              value={code}
              onChange={handleCodeInput}
              autoFocus
              maxLength={6}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleJoin}
                disabled={code.length !== 6}
              >
                Rejoindre →
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 0, padding: '0 20px', width: 'auto' }}
                onClick={() => { setJoining(false); setCode('') }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <p className={styles.version}>v0.1 · Vache-Taureau PWA</p>
    </div>
  )
}
