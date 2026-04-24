'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function DisplayPage() {
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
                color: isNewest ? '#ffffff' : 'rgba(255,255,255,0.75)',
                fontSize,
                lineHeight: 1.25,
                fontWeight: isNewest ? 400 : 300,
                marginBottom: isNewest ? 0 : 20,
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '14px',
        color: 'rgba(255,255,255,0.1)',
        fontSize: 12, letterSpacing: '0.06em',
        fontFamily: 'sans-serif'
      }}>
        Scan the QR code on the back of this screen to send a message
      </div>

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
