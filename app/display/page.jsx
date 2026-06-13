'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { SettingsBar, useMessageStyle } from '../_components/SettingsBar'

export default function DisplayPage() {
  const [messages, setMessages] = useState([])
  const [showQr, setShowQr] = useState(false)
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const { scale, color, setScale, setColor } = useMessageStyle()

  useEffect(() => {
    async function load() {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(20)
      if (msgs) setMessages(msgs)
    }
    load()
  }, [])

  useEffect(() => {
    supabase
      .from('presence')
      .update({ is_home: true, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .then(({ error }) => {
        if (error) console.error('Set presence on failed:', error)
      })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const setAway = () => {
      try {
        fetch(`${url}/rest/v1/presence?id=eq.1`, {
          method: 'PATCH',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ is_home: false, updated_at: new Date().toISOString() }),
          keepalive: true,
        })
      } catch {}
    }

    window.addEventListener('beforeunload', setAway)
    window.addEventListener('pagehide', setAway)

    return () => {
      window.removeEventListener('beforeunload', setAway)
      window.removeEventListener('pagehide', setAway)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('display-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        setMessages(m => [...m, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => cancelAnimationFrame(id)
  }, [messages])

  const clearConversation = async () => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      console.error('Clear failed:', error)
      return
    }
    setMessages([])
  }

  const recent = messages.slice(-5)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e0c',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Georgia, "Times New Roman", serif',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        zIndex: 0
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: '16px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(240,165,0,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px #4ade80',
            animation: 'pulse 2.5s infinite'
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13, letterSpacing: '0.13em', textTransform: 'uppercase',
            fontFamily: 'sans-serif'
          }}>
            Family Messages
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowQr(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(240,165,0,0.12)',
              border: '1.5px solid rgba(240,165,0,0.4)',
              color: '#f0a500',
              borderRadius: 40,
              padding: '10px 18px',
              fontSize: 15, fontFamily: 'sans-serif',
              fontWeight: 600, letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            📷 Send me a message
          </button>

          <Link
            href="/guide"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(240,165,0,0.25)',
              color: 'rgba(240,165,0,0.85)',
              borderRadius: 40,
              padding: '10px 18px',
              fontSize: 15, fontFamily: 'sans-serif',
              fontWeight: 600, letterSpacing: '0.04em',
              textDecoration: 'none',
            }}
          >
            ❔ How to use this
          </Link>

          <Link
            href="/listen?from=display"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(240,165,0,0.12)',
              border: '1.5px solid rgba(240,165,0,0.4)',
              color: '#f0a500',
              borderRadius: 40,
              padding: '10px 20px',
              fontSize: 15, fontFamily: 'sans-serif',
              fontWeight: 600, letterSpacing: '0.04em',
              textDecoration: 'none',
            }}
          >
            🎧 Listen Mode
          </Link>
        </div>

        <div
          aria-label="Papa is home"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(74,222,128,0.15)',
            border: '1.5px solid rgba(74,222,128,0.5)',
            borderRadius: 40,
            padding: '10px 22px',
          }}
        >
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 10px #4ade80',
            flexShrink: 0,
          }} />
          <span style={{
            color: '#4ade80',
            fontSize: 15, fontFamily: 'sans-serif',
            fontWeight: 600, letterSpacing: '0.04em',
          }}>
            Papa is home
          </span>
        </div>
      </div>

      <div ref={scrollRef} style={{
        flex: 1, position: 'relative', zIndex: 1,
        padding: '32px 56px 40px',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', gap: 0
      }}>
        {recent.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.1)',
            fontSize: 26, marginTop: 'auto', marginBottom: 'auto',
            fontFamily: 'sans-serif'
          }}>
            Waiting for messages…
          </div>
        )}

        {recent.map((msg, i) => {
          const isNewest = i === recent.length - 1
          const age = recent.length - 1 - i
          const opacity = isNewest ? 1 : Math.max(0.15, 0.7 - age * 0.17)
          const fontSize = isNewest
            ? 'clamp(54px, 7.5vw, 96px)'
            : `clamp(26px, ${Math.max(3, 5.5 - age * 0.8)}vw, 56px)`

          return (
            <div
              key={msg.id}
              style={{
                opacity,
                marginBottom: isNewest ? 0 : 4,
                transition: 'opacity 0.5s ease',
                animation: isNewest ? 'fadeUp 0.35s ease forwards' : 'none',
              }}
            >
              <div style={{
                color: '#f0a500',
                fontSize: isNewest ? 'clamp(15px, 1.8vw, 22px)' : 'clamp(11px, 1.2vw, 15px)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: isNewest ? 6 : 2,
                fontFamily: 'sans-serif',
                fontWeight: 700,
              }}>
                {msg.sender}
              </div>
              <div style={{
                color,
                fontSize: `calc(${fontSize} * ${scale})`,
                lineHeight: 1.25,
                fontWeight: isNewest ? 400 : 300,
                marginBottom: isNewest ? 0 : 20,
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '14px',
        color: 'rgba(255,255,255,0.1)',
        fontSize: 12, letterSpacing: '0.06em',
        fontFamily: 'sans-serif'
      }}>
        Tap “Send me a message” above — or scan the QR code on the back of this screen
      </div>

      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 24, fontFamily: 'sans-serif',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f0e0c', border: '1px solid rgba(240,165,0,0.3)',
              borderRadius: 24, padding: '36px 40px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <h2 style={{ color: '#f0a500', fontSize: 'clamp(26px, 4vw, 38px)', margin: '0 0 6px', fontWeight: 800, textAlign: 'center' }}>
              Send Papa a message
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.4 }}>
              Open your phone camera and point it at this code.
            </p>
            <div style={{ background: '#fff', padding: 18, borderRadius: 18 }}>
              <img src="/qr-talk.png" alt="QR code to send Papa a message" style={{ display: 'block', width: 'min(64vw, 320px)', height: 'min(64vw, 320px)' }} />
            </div>
            <button
              onClick={() => setShowQr(false)}
              style={{
                marginTop: 28, background: '#f0a500', color: '#1a1410',
                border: 'none', borderRadius: 14, padding: '16px 44px',
                fontSize: 20, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <SettingsBar
        scale={scale}
        color={color}
        setScale={setScale}
        setColor={setColor}
        onClear={clearConversation}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
