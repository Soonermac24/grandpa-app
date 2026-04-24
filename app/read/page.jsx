'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { SettingsBar, useMessageStyle } from '../_components/SettingsBar'

export default function ReadPage() {
  const [messages, setMessages] = useState([])
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const { scale, color, setScale, setColor } = useMessageStyle()

  // Load recent messages
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setMessages(data.reverse())
    }
    load()
  }, [])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('read-messages')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages'
      }, payload => {
        setMessages(m => [...m, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Auto scroll to latest
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => cancelAnimationFrame(id)
  }, [messages])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    // Check if already subscribed
    if ('PushManager' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setPushEnabled(true)
        })
      })
    }
  }, [])

  const enablePushNotifications = async () => {
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications to get alerts when family sends a message.')
        setPushLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      })
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, type: 'papa' })
      })
      setPushEnabled(true)
    } catch (e) {
      console.error(e)
    } finally {
      setPushLoading(false)
    }
  }

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

  const recent = messages.slice(-6)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e0c',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Georgia, serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(240,165,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4ade80', boxShadow: '0 0 6px #4ade80',
            animation: 'pulse 2.5s infinite'
          }} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
            Messages
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/listen"
            style={{
              background: 'rgba(240,165,0,0.08)',
              border: '1px solid rgba(240,165,0,0.35)',
              color: '#f0a500', borderRadius: 20, padding: '6px 12px',
              fontSize: 12, fontFamily: 'sans-serif', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🎧 Listen
          </Link>
          {!pushEnabled && 'PushManager' in (typeof window !== 'undefined' ? window : {}) && (
          <button
            onClick={enablePushNotifications}
            disabled={pushLoading}
            style={{
              background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.35)',
              color: '#f0a500', borderRadius: 20, padding: '6px 14px',
              fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 600,
            }}
          >
            {pushLoading ? 'Setting up…' : '🔔 Notify me'}
          </button>
        )}
          {pushEnabled && (
            <span style={{ color: '#4ade80', fontSize: 12, fontFamily: 'sans-serif' }}>🔔 On</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, padding: '24px 20px 32px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: 20,
      }}>
        {recent.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: 80, fontSize: 18, fontFamily: 'sans-serif' }}>
            No messages yet
          </div>
        )}
        {recent.map((msg, i) => {
          const isNewest = i === recent.length - 1
          return (
            <div
              key={msg.id}
              style={{
                opacity: isNewest ? 1 : Math.max(0.3, 1 - (recent.length - 1 - i) * 0.15),
                animation: isNewest ? 'fadeUp 0.3s ease' : 'none',
              }}
            >
              <div style={{
                color: '#f0a500', fontSize: 11,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                marginBottom: 4, fontFamily: 'sans-serif', fontWeight: 700,
              }}>
                {msg.sender}
              </div>
              <div style={{
                color,
                fontSize: `calc(${isNewest ? 'clamp(32px, 8vw, 52px)' : 'clamp(22px, 5vw, 34px)'} * ${scale})`,
                lineHeight: 1.3,
                fontWeight: isNewest ? 400 : 300,
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <SettingsBar
        scale={scale}
        color={color}
        setScale={setScale}
        setColor={setColor}
        onClear={clearConversation}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array()
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
