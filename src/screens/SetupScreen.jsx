import { useState } from 'react'

const PRESETS = [1, 2, 3, 5]

export default function SetupScreen({ navigate, goBack, config, setConfig, className }) {
  const [customMode, setCustomMode] = useState(false)
  const [customVal, setCustomVal] = useState('')

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }))

  const handleTimeSelect = (val) => {
    setCustomMode(false)
    set('timeLimit', val)
  }

  const handleCustomChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setCustomVal(raw)
    const n = parseInt(raw, 10)
    if (n >= 1 && n <= 60) set('timeLimit', n)
  }

  const handleCustomFocus = () => {
    setCustomMode(true)
    setCustomVal(PRESETS.includes(config.timeLimit) ? '' : String(config.timeLimit))
  }

  return (
    <div className={`screen-container ${className || ''}`}>
      <div className="status-bar-mini">
        <span>{new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>●●●●</span>
      </div>

      <button className="nav-back" onClick={goBack}>← Retour</button>
      <div className="section-title">Configuration</div>
      <div className="section-sub">Choisissez les règles de la partie</div>

      <p className="field-label">Nombre de chiffres</p>
      <div className="selector-group">
        {[3, 4, 5].map(d => (
          <button
            key={d}
            className={`selector-btn ${config.digits === d ? 'selected' : ''}`}
            onClick={() => set('digits', d)}
          >{d}</button>
        ))}
      </div>

      <p className="field-label">Temps par tour (minutes)</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {PRESETS.map(v => (
          <button
            key={v}
            className={`time-btn ${!customMode && config.timeLimit === v ? 'selected' : ''}`}
            style={{ flex: 1, minWidth: 60 }}
            onClick={() => handleTimeSelect(v)}
          >{v} min</button>
        ))}
        <div style={{ position: 'relative', flex: 1, minWidth: 90 }}>
          <input
            type="number"
            min={1}
            max={60}
            placeholder="Custom"
            value={customMode ? customVal : ''}
            onFocus={handleCustomFocus}
            onChange={handleCustomChange}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 44,
              padding: '8px 12px',
              background: 'var(--surface2)',
              border: `1px solid ${customMode ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12,
              color: customMode ? 'var(--accent)' : 'var(--muted)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              textAlign: 'center',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={() => navigate('secret')}>
        Suivant →
      </button>
    </div>
  )
}
