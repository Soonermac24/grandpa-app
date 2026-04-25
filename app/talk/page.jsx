'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function TalkPage() {
  const [name, setName] = useState('')
  const [nameSet, setNameSet] = useState(false)
  const [isHome, setIsHome] = useState(false)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [sent, setSent] = useState(null)       // last sent message text
  const [history, setHistory] = useState([])   // this session's sent messages
  const [error, setError] = useState('')
  const [micGranted, setMicGranted] = useState(false)
  const [enablingMic, setEnablingMic] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const wantsToRecordRef = useRef(false)

  // Load saved name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('papa-app-name')
    if (saved) { setName(saved); setNameSet(true) }
  }, [])

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Check current mic permission so returning users skip the enable step
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return
    navigator.permissions.query({ name: 'microphone' })
      .then(result => {
        setMicGranted(result.state === 'granted')
        result.onchange = () => setMicGranted(result.state === 'granted')
      })
      .catch(() => {})
  }, [])

  const enableMicrophone = async () => {
    setError('')
    setEnablingMic(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Release the stream right away — we just wanted the permission grant
      stream.getTracks().forEach(t => t.stop())
      setMicGranted(true)
    } catch {
      setError('Microphone access denied. Allow it in your browser settings.')
    } finally {
      setEnablingMic(false)
    }
  }

  // Watch papa's presence
  useEffect(() => {
    async function loadPresence() {
      const { data } = await supabase
        .from('presence')
        .select('is_home')
        .eq('id', 1)
        .single()
      if (data) setIsHome(data.is_home)
    }
    loadPresence()

    const channel = supabase
      .channel('talk-presence')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'presence'
      }, payload => setIsHome(payload.new.is_home))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const saveName = () => {
    if (!name.trim()) return
    localStorage.setItem('papa-app-name', name.trim())
    setNameSet(true)
  }

  const startRecording = async () => {
    setError('')
    wantsToRecordRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // If the user already released before getUserMedia resolved, abort cleanly
      if (!wantsToRecordRef.current) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      streamRef.current = stream
      chunksRef.current = []

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch {
      setError('Microphone access denied. Check browser permissions.')
    }
  }

  const stopRecordingAndSend = () => {
    wantsToRecordRef.current = false
    if (!mediaRecorderRef.current) return
    setRecording(false)
    setProcessing(true)

    mediaRecorderRef.current.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'audio.webm')

        const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
        const { text, error: apiError } = await res.json()

        if (apiError || !text?.trim()) {
          setError(apiError || 'Could not understand. Try again.')
          setProcessing(false)
          return
        }

        // Insert into Supabase
        const { error: insertError } = await supabase.from('messages').insert({
          sender: name.trim(),
          text: text.trim(),
        })

        if (insertError) {
          console.error('Supabase insert failed:', insertError)
          setError(`Send failed: ${insertError.message}`)
          return
        }

        const entry = { id: Date.now(), text: text.trim() }
        setHistory(h => [entry, ...h].slice(0, 10))
        setSent(text.trim())
        setTimeout(() => setSent(null), 3000)
      } catch (err) {
        console.error('stopRecordingAndSend error:', err)
        setError('Something went wrong. Try again.')
      } finally {
        setProcessing(false)
        streamRef.current?.getTracks().forEach(t => t.stop())
      }
    }

    mediaRecorderRef.current.stop()
  }

  // ── Name entry ──
  if (!nameSet) {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf7f2',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>👋</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1410', margin: '0 0 8px', textAlign: 'center' }}>
          Talk to Papa
        </h1>
        <p style={{ color: '#999', fontSize: 16, marginBottom: 40, textAlign: 'center', maxWidth: 280 }}>
          Enter your name so he knows who's sending
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveName()}
          placeholder="Your name…"
          autoFocus
          style={{
            width: '100%', maxWidth: 320,
            padding: '16px 20px', fontSize: 22,
            border: '2px solid #e8e0d0', borderRadius: 14,
            outline: 'none', background: '#fff',
            color: '#1a1410', textAlign: 'center',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={saveName}
          disabled={!name.trim()}
          style={{
            marginTop: 16, width: '100%', maxWidth: 320,
            padding: 18, fontSize: 18, fontWeight: 800,
            background: name.trim() ? '#f0a500' : '#e8e0d0',
            color: name.trim() ? '#fff' : '#bbb',
            border: 'none', borderRadius: 14,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            boxSizing: 'border-box',
          }}
        >
          Let's go →
        </button>
      </div>
    )
  }

  // ── Talk screen ──
  return (
    <div style={{
      minHeight: '100vh', background: '#faf7f2',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 24px 48px',
      fontFamily: 'sans-serif',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <button
          onClick={() => { setNameSet(false) }}
          style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 14, cursor: 'pointer', padding: 0 }}
        >
          ← {name}
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isHome ? 'rgba(74,222,128,0.12)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${isHome ? 'rgba(74,222,128,0.4)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 20, padding: '5px 12px',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isHome ? '#4ade80' : '#ccc',
          }} />
          <span style={{ fontSize: 12, color: isHome ? '#16a34a' : '#aaa', fontWeight: 600 }}>
            {isHome ? 'Papa is home' : 'Papa is away'}
          </span>
        </div>
      </div>

      {/* Big mic button (or Enable Microphone gate) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 }}>
        {!micGranted ? (
          <>
            <button
              onClick={enableMicrophone}
              disabled={enablingMic}
              style={{
                width: '100%', maxWidth: 320,
                padding: 22,
                fontSize: 20, fontWeight: 800,
                background: enablingMic ? '#e8e0d0' : '#f0a500',
                color: enablingMic ? '#bbb' : '#fff',
                border: 'none', borderRadius: 18,
                cursor: enablingMic ? 'wait' : 'pointer',
                fontFamily: 'sans-serif',
                letterSpacing: '0.02em',
                boxShadow: '0 10px 32px rgba(240,165,0,0.3)',
              }}
            >
              {enablingMic ? 'Waiting…' : '🎙️  Enable Microphone'}
            </button>
            <div style={{
              marginTop: 18, maxWidth: 280, textAlign: 'center',
              color: '#888', fontSize: 14, lineHeight: 1.45,
            }}>
              Tap the button above and allow microphone access, then you can hold the mic to talk to Papa.
            </div>
            {error && (
              <div style={{ marginTop: 14, color: '#dc2626', fontSize: 14, textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndSend}
              onTouchStart={e => { e.preventDefault(); startRecording() }}
              onTouchEnd={e => { e.preventDefault(); stopRecordingAndSend() }}
              disabled={processing}
              style={{
                width: 160, height: 160, borderRadius: '50%',
                background: recording
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : processing
                    ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                    : 'linear-gradient(135deg, #1a1510, #2a2520)',
                border: 'none', cursor: processing ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 60,
                boxShadow: recording
                  ? '0 0 0 16px rgba(239,68,68,0.15), 0 12px 40px rgba(239,68,68,0.3)'
                  : '0 12px 40px rgba(0,0,0,0.18)',
                transform: recording ? 'scale(1.07)' : 'scale(1)',
                transition: 'all 0.15s ease',
                userSelect: 'none', WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {processing ? '⏳' : '🎙️'}
            </button>

            <div style={{
              marginTop: 20,
              fontSize: 14, fontWeight: 700, letterSpacing: '0.1em',
              color: recording ? '#ef4444' : processing ? '#9ca3af' : '#9ca3af',
              textTransform: 'uppercase',
            }}>
              {recording ? 'RELEASE TO SEND' : processing ? 'SENDING…' : 'HOLD TO TALK'}
            </div>

            {error && (
              <div style={{ marginTop: 14, color: '#dc2626', fontSize: 14, textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sent confirmation + history */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        {sent && (
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '2px solid #4ade80',
            padding: '14px 18px', marginBottom: 12,
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
              ✓ SENT
            </div>
            <div style={{ fontSize: 17, color: '#1a1410', lineHeight: 1.4 }}>{sent}</div>
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#ccc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              This session
            </div>
            {history.map(h => (
              <div key={h.id} style={{
                background: 'rgba(0,0,0,0.04)', borderRadius: 10,
                padding: '10px 14px', marginBottom: 6,
                fontSize: 15, color: '#666', lineHeight: 1.4,
              }}>
                {h.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
