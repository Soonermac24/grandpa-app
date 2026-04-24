'use client'
import { useEffect, useState } from 'react'

const SCALE_KEY = 'papa-app-font-scale'
const COLOR_KEY = 'papa-app-text-color'

const MIN_SCALE = 0.7
const MAX_SCALE = 1.6
const STEP = 0.1

const COLOR_PRESETS = [
  { name: 'White',        value: '#ffffff' },
  { name: 'Warm yellow',  value: '#fde68a' },
  { name: 'Light blue',   value: '#bae6fd' },
  { name: 'Light green',  value: '#bbf7d0' },
  { name: 'Soft orange',  value: '#fed7aa' },
]

export function useMessageStyle() {
  const [scale, setScaleState] = useState(1)
  const [color, setColorState] = useState('#ffffff')

  useEffect(() => {
    const savedScale = parseFloat(localStorage.getItem(SCALE_KEY))
    if (!Number.isNaN(savedScale) && savedScale >= MIN_SCALE && savedScale <= MAX_SCALE) {
      setScaleState(savedScale)
    }
    const savedColor = localStorage.getItem(COLOR_KEY)
    if (savedColor && COLOR_PRESETS.some(p => p.value === savedColor)) {
      setColorState(savedColor)
    }
  }, [])

  const setScale = (next) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
    const rounded = Math.round(clamped * 10) / 10
    setScaleState(rounded)
    localStorage.setItem(SCALE_KEY, String(rounded))
  }

  const setColor = (value) => {
    setColorState(value)
    localStorage.setItem(COLOR_KEY, value)
  }

  return { scale, color, setScale, setColor }
}

const btnStyle = {
  background: 'transparent',
  border: '1px solid rgba(240,165,0,0.3)',
  color: 'rgba(240,165,0,0.7)',
  borderRadius: 8,
  padding: '4px 9px',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  fontWeight: 600,
  transition: 'color 0.2s, border-color 0.2s, opacity 0.2s',
}

export function SettingsBar({ scale, color, setScale, setColor, onClear }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const t = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(t)
  }, [confirming])

  const handleClear = () => {
    if (!confirming) { setConfirming(true); return }
    setConfirming(false)
    onClear?.()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close settings' : 'Open settings'}
        aria-expanded={open}
        className="papa-settings-trigger"
        style={{
          position: 'fixed', bottom: 12, right: 16, zIndex: 10,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid rgba(240,165,0,${open ? 0.55 : 0.25})`,
          color: `rgba(240,165,0,${open ? 0.9 : 0.55})`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontFamily: 'sans-serif',
          transition: 'color 0.2s, border-color 0.2s',
          padding: 0,
        }}
      >
        ⚙
      </button>

      {open && (
        <div
          role="toolbar"
          aria-label="Display settings"
          style={{
            position: 'fixed', bottom: 56, right: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(15,14,12,0.92)',
            border: '1px solid rgba(240,165,0,0.22)',
            borderRadius: 14,
            padding: '10px 14px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontFamily: 'sans-serif',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          <button
            type="button"
            onClick={() => setScale(scale - STEP)}
            disabled={scale <= MIN_SCALE + 0.0001}
            aria-label="Decrease text size"
            className="papa-settings-btn"
            style={btnStyle}
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setScale(scale + STEP)}
            disabled={scale >= MAX_SCALE - 0.0001}
            aria-label="Increase text size"
            className="papa-settings-btn"
            style={{ ...btnStyle, fontSize: 15 }}
          >
            A+
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(240,165,0,0.2)' }} />

          <div style={{ display: 'flex', gap: 6 }}>
            {COLOR_PRESETS.map(p => {
              const selected = color === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  aria-label={`Set text color to ${p.name}`}
                  aria-pressed={selected}
                  title={p.name}
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: p.value,
                    border: selected
                      ? '2px solid #f0a500'
                      : '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer', padding: 0,
                    transition: 'transform 0.15s, border-color 0.15s',
                    transform: selected ? 'scale(1.12)' : 'scale(1)',
                  }}
                />
              )
            })}
          </div>

          {onClear && (
            <>
              <div style={{ width: 1, height: 20, background: 'rgba(240,165,0,0.2)' }} />
              <button
                type="button"
                onClick={handleClear}
                aria-label={confirming ? 'Confirm clear conversation' : 'Clear conversation'}
                className="papa-settings-btn"
                style={{
                  ...btnStyle,
                  color: confirming ? '#fecaca' : 'rgba(240,165,0,0.7)',
                  borderColor: confirming ? 'rgba(239,68,68,0.55)' : 'rgba(240,165,0,0.3)',
                  fontSize: 10.5, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '6px 10px',
                }}
              >
                {confirming ? 'Tap to confirm' : 'Clear'}
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .papa-settings-trigger:hover {
          color: rgba(240,165,0,0.95) !important;
          border-color: rgba(240,165,0,0.6) !important;
        }
        .papa-settings-btn:hover:not(:disabled) {
          color: rgba(240,165,0,0.95) !important;
          border-color: rgba(240,165,0,0.55) !important;
        }
        .papa-settings-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </>
  )
}
