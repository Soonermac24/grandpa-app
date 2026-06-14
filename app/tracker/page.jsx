'use client'
import { useEffect, useState, useCallback } from 'react'

/**
 * /tracker — private, owner-only usage dashboard.
 *
 * Not linked anywhere and noindex'd. You reach it by knowing the URL and
 * the passcode (checked server-side against TRACKER_PASSCODE). Shows
 * message counts (and who's sending), Listen-Mode vs Talk usage, and
 * projected Whisper cost.
 */

const GOLD = '#f0a500'
const GREEN = '#4ade80'

const fmtUSD = (n) => `$${(Number(n) || 0).toFixed(2)}`
const fmtMin = (n) => `${(Number(n) || 0).toFixed(1)} min`
const fmtDate = (s) => {
  try { return new Date(s).toLocaleString() } catch { return s }
}

export default function TrackerPage() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (code) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Something went wrong.')
        setAuthed(false)
        sessionStorage.removeItem('tracker-pass')
        return
      }
      setData(json)
      setAuthed(true)
      sessionStorage.setItem('tracker-pass', code)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-use a passcode from this browser session so refresh doesn't re-prompt.
  useEffect(() => {
    const saved = sessionStorage.getItem('tracker-pass')
    if (saved) { setPasscode(saved); load(saved) }
  }, [load])

  if (!authed) {
    return (
      <div style={shell}>
        <form
          onSubmit={(e) => { e.preventDefault(); load(passcode) }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 340, textAlign: 'center' }}
        >
          <div style={{ fontSize: 40 }}>🔒</div>
          <h1 style={{ color: '#fff', fontSize: 24, margin: 0 }}>Tracker</h1>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            autoFocus
            style={input}
          />
          <button type="submit" disabled={loading || !passcode} style={primaryBtn}>
            {loading ? 'Checking…' : 'Unlock'}
          </button>
          {error && <div style={{ color: '#fca5a5', fontSize: 14 }}>{error}</div>}
        </form>
      </div>
    )
  }

  const s = data?.stats || {}
  const m = s.messages || {}
  const costs = data?.costs || {}
  const bySource = data?.bySource || []
  const listen = bySource.find((x) => x.source === 'listen')
  const talk = bySource.find((x) => x.source === 'talk')
  const unknown = bySource.find((x) => x.source === 'unknown')

  return (
    <div style={{ ...shell, alignItems: 'stretch', display: 'block', padding: '28px 22px 60px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ color: GOLD, fontSize: 26, margin: 0, fontWeight: 800 }}>Papa App · Usage Tracker</h1>
          <button onClick={() => load(passcode)} disabled={loading} style={ghostBtn}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 22 }}>
          As of {fmtDate(s.generated_at)} · Private — only you can see this.
        </div>

        {/* Top cards */}
        <div style={grid}>
          <Card label="Messages (all time)" value={m.total ?? 0} sub={`${m.last7 ?? 0} in last 7 days · ${m.last30 ?? 0} in last 30`} />
          <Card label="Listen Mode" value={fmtMin(listen?.minutes)} sub={`${fmtMin(listen?.minutes30d)} in last 30 days`} accent={GREEN} />
          <Card label="Talk (family voice)" value={fmtMin(talk?.minutes)} sub={`${fmtMin(talk?.minutes30d)} in last 30 days`} />
          <Card label="Projected this month" value={fmtUSD(costs.projectedMonthly)} sub={`Based on the last 7 days`} accent={GOLD} />
        </div>

        {/* Cost breakdown */}
        <Section title="Cost (OpenAI Whisper transcription)">
          <Row k="Rate" v={`${fmtUSD(costs.ratePerMin)} / minute`} />
          <Row k="Total transcribed" v={fmtMin(costs.totalMinutes)} />
          <Row k="Cost — all time" v={fmtUSD(costs.totalCost)} />
          <Row k="Cost — last 30 days" v={fmtUSD(costs.cost30d)} />
          <Row k="Projected full month" v={fmtUSD(costs.projectedMonthly)} strong />
          {unknown && unknown.minutes > 0 && (
            <Row k="Untagged (before tracking)" v={`${fmtMin(unknown.minutes)} · ${fmtUSD(unknown.cost)}`} muted />
          )}
        </Section>

        {/* Who's messaging */}
        <Section title="Who's messaging Papa">
          {(m.by_sender || []).length === 0 && <div style={muted}>No messages yet.</div>}
          {(m.by_sender || []).map((row) => (
            <Row key={row.sender} k={row.sender} v={`${row.n} message${row.n === 1 ? '' : 's'} · last ${fmtDate(row.last_at)}`} />
          ))}
        </Section>

        {/* Recent messages */}
        <Section title="Recent messages">
          {(m.recent || []).length === 0 && <div style={muted}>No messages yet.</div>}
          {(m.recent || []).map((row, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row.sender}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(row.created_at)}</span>
              </div>
              <div style={{ color: '#fff', fontSize: 16, marginTop: 2 }}>{row.text}</div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}

function Card({ label, value, sub, accent = '#fff' }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: accent, fontSize: 30, fontWeight: 800, margin: '6px 0 4px' }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{sub}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', marginTop: 18 }}>
      <h2 style={{ color: '#fff', fontSize: 16, margin: '0 0 10px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ k, v, strong, muted: isMuted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: isMuted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.6)', fontSize: 14 }}>{k}</span>
      <span style={{ color: isMuted ? 'rgba(255,255,255,0.4)' : '#fff', fontSize: 14, fontWeight: strong ? 800 : 500 }}>{v}</span>
    </div>
  )
}

const shell = {
  minHeight: '100dvh', background: '#0f0e0c',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'sans-serif', color: '#fff', padding: 24,
}
const muted = { color: 'rgba(255,255,255,0.4)', fontSize: 14 }
const input = {
  padding: '14px 16px', fontSize: 18, borderRadius: 12,
  border: '1px solid rgba(240,165,0,0.3)', background: 'rgba(255,255,255,0.05)',
  color: '#fff', outline: 'none', textAlign: 'center',
}
const primaryBtn = {
  padding: '14px', fontSize: 17, fontWeight: 800, borderRadius: 12,
  background: GOLD, color: '#1a1410', border: 'none', cursor: 'pointer',
}
const ghostBtn = {
  padding: '8px 14px', fontSize: 14, borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(240,165,0,0.3)',
  color: GOLD, cursor: 'pointer',
}
const grid = {
  display: 'grid', gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
}
