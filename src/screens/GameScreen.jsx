import { useState, useEffect, useRef, useCallback } from 'react'
import { evaluate, isValidNumber } from '../hooks/gameLogic.js'
import { listenToGame, submitGuess, setWinner } from '../firebase/gameService.js'

export default function GameScreen({ navigate, config, playerSecret, setGameResult, gameId, role, className }) {
  const digitCount = config.digits
  const timeLimitSec = (config.timeLimit || 3) * 60

  const [gameData, setGameData] = useState(null)
  const [inputDigits, setInputDigits] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSec)
  const timerRef = useRef(null)
  const guessHistoryRef = useRef(null)
  const hasNavigatedRef = useRef(false)

  // Player's guesses and opponent's guesses from game data
  const playerGuesses = gameData
    ? (role === 'creator' ? gameData.creatorGuesses : gameData.joinerGuesses) || []
    : []
  const opponentGuesses = gameData
    ? (role === 'creator' ? gameData.joinerGuesses : gameData.creatorGuesses) || []
    : []
  const opponentSecret = gameData
    ? (role === 'creator' ? gameData.joinerSecret : gameData.creatorSecret)
    : null

  // Subscribe to real-time game updates
  useEffect(() => {
    if (!gameId) return
    const unsub = listenToGame(gameId, (data) => {
      setGameData(data)
      setIsPlayerTurn(data.turn === role)

      // Detect winner
      if (data.winner && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true
        clearInterval(timerRef.current)
        const playerWon = data.winner === role
        const oppSecret = role === 'creator' ? data.joinerSecret : data.creatorSecret
        const pGuesses = role === 'creator' ? data.creatorGuesses : data.joinerGuesses
        const oGuesses = role === 'creator' ? data.joinerGuesses : data.creatorGuesses
        setGameResult({
          winner: playerWon ? 'player' : 'opponent',
          playerGuesses: pGuesses || [],
          playerSecret,
          aiSecret: oppSecret,
          aiGuesses: oGuesses || [],
        })
        navigate('win')
      }
    })
    return () => unsub()
  }, [gameId, role]) // eslint-disable-line

  // Scroll to bottom on new guesses
  useEffect(() => {
    if (guessHistoryRef.current) {
      guessHistoryRef.current.scrollTop = guessHistoryRef.current.scrollHeight
    }
  }, [playerGuesses.length])

  // Timer: reset + start when it's player's turn
  useEffect(() => {
    clearInterval(timerRef.current)

    if (isPlayerTurn) {
      setSecondsLeft(timeLimitSec)
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            // Time's up — player loses
            const opponent = role === 'creator' ? 'joiner' : 'creator'
            setWinner(gameId, opponent)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timerRef.current)
  }, [isPlayerTurn, timeLimitSec]) // eslint-disable-line

  const timerPct = (secondsLeft / timeLimitSec) * 100
  const isWarning = timerPct <= 25

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const handleKey = useCallback((key) => {
    if (!isPlayerTurn) return
    if (key === 'del') {
      setInputDigits(d => d.slice(0, -1))
    } else if (inputDigits.length < digitCount && !inputDigits.includes(key)) {
      setInputDigits(d => [...d, key])
    }
  }, [isPlayerTurn, inputDigits, digitCount])

  const handleSubmit = useCallback(async () => {
    const guess = inputDigits.join('')
    if (!isValidNumber(guess, digitCount) || !opponentSecret) return

    const result = evaluate(guess, opponentSecret)
    setInputDigits([])

    // Submit guess to Firebase (flips turn)
    await submitGuess(gameId, role, guess, result)

    // Check for win
    if (result.taureaux === digitCount) {
      await setWinner(gameId, role)
    }
  }, [inputDigits, digitCount, opponentSecret, gameId, role])

  return (
    <div className={`screen-container ${className || ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="status-bar-mini">
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>Vache-Taureau</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Tour {playerGuesses.length + 1} · {digitCount} chiffres
          </div>
        </div>
        <div style={{
          background: isPlayerTurn ? 'var(--accent)' : 'var(--surface2)',
          color: isPlayerTurn ? '#0d0d0f' : 'var(--muted)',
          fontFamily: "'Syne', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          letterSpacing: '0.05em',
          border: isPlayerTurn ? 'none' : '1px solid var(--border)',
          transition: 'all 0.3s',
        }}>
          {isPlayerTurn ? 'VOTRE TOUR' : '⏳ EN ATTENTE'}
        </div>
      </div>

      {/* Timer bar */}
      <div className="timer-bar-wrap" style={{ marginBottom: 6 }}>
        <div
          className={`timer-bar ${isWarning ? 'warning' : ''}`}
          style={{
            width: isPlayerTurn ? `${timerPct}%` : '100%',
            transition: isPlayerTurn ? 'width 1s linear, background 1s' : 'none',
          }}
        />
      </div>

      {/* Timer countdown */}
      <div style={{
        textAlign: 'right',
        fontSize: 12,
        color: isPlayerTurn ? (isWarning ? 'var(--accent2)' : 'var(--muted)') : 'var(--muted)',
        marginBottom: 14,
        fontFamily: "'DM Mono', monospace",
        transition: 'color 0.5s',
      }}>
        {isPlayerTurn ? formatTime(secondsLeft) : '— : ——'}
      </div>

      {/* Opponent waiting banner */}
      {!isPlayerTurn && (
        <div style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700 }}>Adversaire</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>En train de jouer...</div>
            </div>
          </div>
          <div className="dot-pulse"><span /><span /><span /></div>
        </div>
      )}

      {/* Guess history */}
      <p className="field-label" style={{ marginBottom: 8 }}>Mes tentatives</p>
      <div
        ref={guessHistoryRef}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, minHeight: 0 }}
      >
        {playerGuesses.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            Aucune tentative encore
          </div>
        ) : playerGuesses.map((g, i) => (
          <div key={i} className="guess-row">
            <div className="guess-number">{g.guess.split('').join(' ')}</div>
            <div className="guess-result">
              <div className="result-chip taureau">🐂 {g.taureaux}</div>
              <div className="result-chip vache">🐄 {g.vaches}</div>
            </div>
          </div>
        ))}
      </div>

      {isPlayerTurn ? (
        <>
          {/* Digit input display */}
          <div className="digit-inputs" style={{ marginBottom: 10 }}>
            {Array.from({ length: digitCount }).map((_, i) => {
              const isFilled = i < inputDigits.length
              const isActive = i === inputDigits.length
              return (
                <div key={i} className={`digit-input ${isFilled ? 'filled' : ''} ${isActive ? 'active' : ''}`}>
                  {isFilled ? inputDigits[i] : isActive ? <div className="cursor" /> : null}
                </div>
              )
            })}
          </div>

          {/* Keypad */}
          <div className="keypad" style={{ gap: 8 }}>
            {['1','2','3','4','5','6','7','8','9'].map(k => (
              <button key={k} className="key" onClick={() => handleKey(k)}>{k}</button>
            ))}
            <button className="key delete" onClick={() => handleKey('del')}>⌫</button>
            <button className="key zero" onClick={() => handleKey('0')}>0</button>
            <button
              className="key"
              style={{
                background: inputDigits.length === digitCount ? 'var(--accent)' : 'var(--surface2)',
                color: inputDigits.length === digitCount ? '#0d0d0f' : 'var(--muted)',
                fontSize: 16,
              }}
              onClick={handleSubmit}
              disabled={inputDigits.length !== digitCount}
            >→</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>
          En attente du tour de l'adversaire...
        </div>
      )}
    </div>
  )
}
