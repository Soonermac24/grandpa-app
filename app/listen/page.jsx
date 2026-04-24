'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const CHUNK_MS = 2500

export default function ListenPage() {
  const [listening, setListening] = useState(false)
  const [transcripts, setTranscripts] = useState([])
  const [inFlight, setInFlight] = useState(0)
  const [error, setError] = useState('')

  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const timerRef = useRef(null)
  const listeningRef = useRef(false)

  const transcribeChunk = async (blob) => {
    setInFlight(n => n + 1)
    try {
      const fd = new FormData()
      fd.append('audio', blob, 'chunk.webm')
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
      const { text, error: apiError } = await res.json()
      if (!apiError && text && text.trim()) {
        setTranscripts(prev => [
          { id: `${Date.now()}-${Math.random()}`, text: text.trim() },
          ...prev,
        ].slice(0, 60))
      }
    } catch {
      // keep the loop going on single-chunk failures
    } finally {
      setInFlight(n => Math.max(0, n - 1))
    }
  }

  const recordChunk = () => {
    const stream = streamRef.current
    if (!stream || !listeningRef.current) return

    const chunks = []
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      if (blob.size > 0 && listeningRef.current) transcribeChunk(blob)
      if (listeningRef.current) recordChunk()
    }
    recorderRef.current = recorder
    recorder.start()
    timerRef.current = setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop()
    }, CHUNK_MS)
  }

  const startListening = async () => {
    setError('')
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      listeningRef.current = true
      setListening(true)
      recordChunk()
    } catch {
      setError('Microphone access denied. Check browser settings.')
    }
  }

  const stopListening = () => {
    listeningRef.current = false
    setListening(false)
    clearTimeout(timerRef.current)
    timerRef.current = null
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      try { rec.stop() } catch {}
    }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const clear = () => setTranscripts([])

  useEffect(() => {
    return () => {
      listeningRef.current = false
      clearTimeout(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{
      height: '100dvh',
      maxHeight: '100dvh',
      overflow: 'hidden',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <div style={{
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <Link href="/read" style={{
          color: 'rgba(255,255,255,0.45)', fontSize: 14,
          textDecoration: 'none', padding: '4px 0',
        }}>
          ← Messages
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: listening ? '#ef4444' : 'rgba(255,255,255,0.35)',
          fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          {listening && <span className="listen-dot" />}
          {listening
            ? (inFlight > 0 ? 'Transcribing…' : 'Listening')
            : 'Listen Mode'}
        </div>
        <button
          onClick={clear}
          disabled={transcripts.length === 0}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: transcripts.length === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
            borderRadius: 14,
            padding: '5px 12px',
            fontSize: 12, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: transcripts.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'sans-serif',
          }}
        >
          Clear
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 22px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {transcripts.length === 0 && !listening && (
          <div style={{
            textAlign: 'center', marginTop: 60,
            color: 'rgba(255,255,255,0.35)', fontSize: 22,
            lineHeight: 1.5, padding: '0 20px',
          }}>
            Tap <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Listen</strong> to start<br />
            transcribing the conversation around you.
          </div>
        )}
        {transcripts.length === 0 && listening && (
          <div style={{
            textAlign: 'center', marginTop: 60,
            color: 'rgba(255,255,255,0.45)', fontSize: 22, fontStyle: 'italic',
          }}>
            Listening…
          </div>
        )}
        {transcripts.map((t, i) => (
          <div
            key={t.id}
            style={{
              fontSize: i === 0 ? 'clamp(48px, 8vw, 72px)' : 'clamp(30px, 5.5vw, 48px)',
              fontWeight: i === 0 ? 500 : 300,
              lineHeight: 1.3,
              marginBottom: 28,
              color: i === 0
                ? '#ffffff'
                : `rgba(255,255,255,${Math.max(0.25, 0.85 - i * 0.15)})`,
              animation: i === 0 ? 'fadeIn 0.3s ease' : 'none',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '12px 20px', background: 'rgba(239,68,68,0.12)',
          color: '#fca5a5', fontSize: 15, textAlign: 'center',
          borderTop: '1px solid rgba(239,68,68,0.3)',
        }}>
          {error}
        </div>
      )}

      <div style={{
        padding: '18px 20px 26px',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', justifyContent: 'center',
        background: '#000',
      }}>
        {!listening ? (
          <button
            onClick={startListening}
            style={{
              width: '100%', maxWidth: 420,
              padding: '22px 28px',
              fontSize: 26, fontWeight: 700,
              background: 'linear-gradient(135deg, #f0a500, #d98a00)',
              color: '#1a1410', border: 'none',
              borderRadius: 18, cursor: 'pointer',
              fontFamily: 'sans-serif',
              letterSpacing: '0.04em',
              boxShadow: '0 10px 32px rgba(240,165,0,0.35)',
            }}
          >
            🎙  Listen
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={{
              width: '100%', maxWidth: 420,
              padding: '22px 28px',
              fontSize: 26, fontWeight: 700,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', border: 'none',
              borderRadius: 18, cursor: 'pointer',
              fontFamily: 'sans-serif',
              letterSpacing: '0.04em',
              boxShadow: '0 10px 32px rgba(239,68,68,0.4)',
            }}
          >
            ⏹  Stop
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .listen-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #ef4444; box-shadow: 0 0 8px #ef4444;
          animation: pulseDot 1.1s infinite;
          display: inline-block;
        }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.35} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
