'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

/**
 * /guide — a captioned, narrated "video" that teaches Papa App.
 *
 * Plays like a slideshow video: big captions, a progress bar, and
 * play/pause/replay controls. A "Skip to…" panel on the right jumps
 * straight to any chapter.
 *
 * Captions are the star (Papa is hard of hearing). Narration (the
 * browser's built-in voice) is an extra for great-grandkids / helpers
 * who read along with him — easy to mute, off-screen for Papa himself.
 *
 * Brand: warm-dark #0f0e0c, gold #f0a500, green #4ade80. Big type,
 * high contrast, large touch targets — senior- and kid-friendly.
 */

const GOLD = '#f0a500'
const GREEN = '#4ade80'
const RED = '#ef4444'

// Each slide: chapter id, big icon, title (the caption), body (the
// step), an optional `demo` that mimics the real on-screen control,
// and `say` (what the narrator reads — a touch more conversational).
const SLIDES = [
  {
    ch: 'welcome', icon: '👋',
    title: 'Welcome to Papa App',
    body: 'This screen shows you what your family says — in big, easy-to-read letters. Let’s walk through it together.',
    say: 'Welcome to Papa App. This screen shows you what your family says, in big easy to read letters. Let us walk through it together.',
  },
  {
    ch: 'reading', icon: '💬',
    title: 'Reading your family’s messages',
    body: 'When family sends a message, it appears right here on your Home screen. The newest message is the biggest one, at the bottom.',
    demo: 'messages',
    say: 'When family sends a message, it appears here on your home screen. The newest message is the biggest one, near the bottom. Older messages fade above it.',
  },
  {
    ch: 'reading', icon: '🟢',
    title: 'The green “Papa is home” badge',
    body: 'When this screen is on, your family sees a green “Papa is home” light. They’ll know you’re here. You don’t have to do anything — just leave the screen on.',
    demo: 'home',
    say: 'When this screen is on, your family sees a green Papa is home light, so they know you are here. You do not have to do anything. Just leave the screen on.',
  },
  {
    ch: 'listen', icon: '🎧',
    title: 'Listen Mode — caption the room',
    body: 'Talking with someone in person and can’t hear them well? Tap the gold “Listen Mode” button at the top of the screen.',
    demo: 'listenpill',
    say: 'Are you talking with someone in person and cannot hear them well? Tap the gold Listen Mode button at the top of the screen.',
  },
  {
    ch: 'listen', icon: '🎙️',
    title: 'Tap the big Listen button',
    body: 'Tap the large gold “Listen” button. Now everything people say out loud appears on the screen as words, while they talk.',
    demo: 'listenbtn',
    say: 'Tap the large gold Listen button. Now everything people say out loud appears on the screen as words, while they talk.',
  },
  {
    ch: 'listen', icon: '⏹️',
    title: 'Tap the red Stop button when done',
    body: 'When you’re finished, tap the red “Stop” button. Then use the “← back” link at the top to return to your messages.',
    demo: 'stopbtn',
    say: 'When you are finished, tap the red Stop button. Then use the back link at the top to return to your messages.',
  },
  {
    ch: 'bigger', icon: '⚙️',
    title: 'Make the words bigger',
    body: 'See the small gear in the bottom-right corner? Tap it to open your settings.',
    demo: 'gear',
    say: 'See the small gear in the bottom right corner of the screen? Tap it to open your settings.',
  },
  {
    ch: 'bigger', icon: '🔠',
    title: 'Bigger, smaller, or a new color',
    body: 'Tap “A+” to make words bigger, or “A−” to make them smaller. Tap a colored dot to change the color of the words. The screen remembers what you pick.',
    demo: 'sizecolor',
    say: 'Tap the A plus button to make words bigger, or A minus to make them smaller. Tap a colored dot to change the color of the words. The screen remembers what you pick.',
  },
  {
    ch: 'phone', icon: '📱',
    title: 'Reading on your phone',
    body: 'Away from home? You can read the same messages on your phone — open Papa App and tap “Messages.”',
    say: 'Are you away from home? You can read the same messages on your phone. Just open Papa App and tap Messages.',
  },
  {
    ch: 'phone', icon: '🔔',
    title: 'Get a buzz when family writes',
    body: 'On your phone, tap “🔔 Notify me” one time. After that, your phone will buzz whenever family sends you a message.',
    demo: 'notify',
    say: 'On your phone, tap the Notify me button one time. After that, your phone will buzz whenever family sends you a message.',
  },
  {
    ch: 'family', icon: '👨‍👩‍👧',
    title: 'For family & great-grandkids',
    body: 'These next steps are for the family members who want to send Papa a message. Anyone can do it from their own phone.',
    say: 'These next steps are for family members who want to send Papa a message. Anyone can do it from their own phone.',
  },
  {
    ch: 'family', icon: '📷',
    title: 'Scan the QR code',
    body: 'On your phone, open the camera and point it at the QR code below (it’s also on the back of Papa’s screen). Tap the link that pops up.',
    demo: 'qr',
    say: 'On your phone, open the camera and point it at the Q R code on the screen. Tap the link that pops up.',
  },
  {
    ch: 'family', icon: '✍️',
    title: 'Type your name once',
    body: 'The first time, type your name (like “Sarah” or “Grandma”) so Papa knows who’s talking. Your phone remembers it after that.',
    say: 'The first time, type your name, like Sarah or Grandma, so Papa knows who is talking. Your phone remembers it after that.',
  },
  {
    ch: 'family', icon: '🎙️',
    title: 'Hold the button and talk',
    body: 'Press and HOLD the big microphone button, say your message, then let go. Your words pop up on Papa’s screen in seconds.',
    demo: 'mic',
    say: 'Press and hold the big microphone button, say your message, then let go. Your words pop up on Papa’s screen in seconds.',
  },
  {
    ch: 'family', icon: '🧒',
    title: 'Helping Papa in person',
    body: 'Great-grandkids: you can help Papa too! Use the gear to make his words bigger, or start Listen Mode for him so he can read what everyone is saying.',
    say: 'Great grandkids, you can help Papa too. Use the gear to make his words bigger, or start Listen Mode for him so he can read what everyone is saying.',
  },
  {
    ch: 'done', icon: '✅',
    title: 'That’s everything!',
    body: 'You’re all set. You can watch this again any time — just press “Replay.” To go to your messages, tap “Go to my screen.”',
    say: 'That is everything. You are all set. You can watch this again any time by pressing Replay.',
  },
]

const CHAPTERS = [
  { id: 'welcome', icon: '👋', label: 'Welcome' },
  { id: 'reading', icon: '💬', label: 'Reading messages' },
  { id: 'listen', icon: '🎧', label: 'Listen Mode' },
  { id: 'bigger', icon: '🔠', label: 'Make text bigger' },
  { id: 'phone', icon: '📱', label: 'On your phone' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'For family' },
  { id: 'done', icon: '✅', label: 'All done' },
]

// First slide index for each chapter (for the skip panel).
const CHAPTER_START = {}
SLIDES.forEach((s, i) => { if (CHAPTER_START[s.ch] === undefined) CHAPTER_START[s.ch] = i })

// Papa's own chapters play slower, so he has more time to read and
// take each step in. Family chapters move at a normal pace.
const PAPA_CHAPTERS = new Set(['welcome', 'reading', 'listen', 'bigger', 'phone', 'done'])

// How long a slide stays up (ms). Scales with how much there is to
// read, with a comfortable floor and ceiling for slow readers.
function slideDuration(slide) {
  const words = (slide.title + ' ' + slide.body).split(/\s+/).length
  if (PAPA_CHAPTERS.has(slide.ch)) {
    return Math.min(20000, Math.max(10000, words * 560))
  }
  return Math.min(13000, Math.max(6000, words * 380))
}

const TICK = 100

export default function GuidePage() {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [narrate, setNarrate] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [canSpeak, setCanSpeak] = useState(false)

  const slide = SLIDES[index]
  const duration = slideDuration(slide)
  const isLast = index === SLIDES.length - 1

  // Detect speech-synthesis support (so we hide the voice toggle when
  // there's no voice to give).
  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = useCallback((text) => {
    if (!narrate || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      u.pitch = 1
      window.speechSynthesis.speak(u)
    } catch {}
  }, [narrate])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch {}
    }
  }, [])

  // Move to a specific slide and (re)start its narration.
  const goTo = useCallback((i, { play = true } = {}) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i))
    setIndex(next)
    setElapsed(0)
    stopSpeaking()
    if (play) {
      setPlaying(true)
      speak(SLIDES[next].say)
    }
  }, [speak, stopSpeaking])

  // The ticking clock that drives auto-advance + the progress bar.
  useEffect(() => {
    if (!started || !playing) return
    const id = setInterval(() => {
      setElapsed(prev => {
        const nextElapsed = prev + TICK
        if (nextElapsed >= duration) {
          if (isLast) {
            setPlaying(false)
            return duration
          }
          // advance on the next frame to avoid setState-in-setState
          setTimeout(() => goTo(index + 1), 0)
          return 0
        }
        return nextElapsed
      })
    }, TICK)
    return () => clearInterval(id)
  }, [started, playing, duration, isLast, index, goTo])

  // Keyboard: space = play/pause, arrows = prev/next.
  useEffect(() => {
    if (!started) return
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); togglePlay() }
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, index])

  // Clean up any speech when leaving the page.
  useEffect(() => () => stopSpeaking(), [stopSpeaking])

  function togglePlay() {
    if (playing) {
      setPlaying(false)
      stopSpeaking()
    } else {
      setPlaying(true)
      speak(slide.say)
    }
  }

  function start() {
    setStarted(true)
    setIndex(0)
    setElapsed(0)
    setPlaying(true)
    // first speak happens here, inside the user gesture, so browsers allow it
    if (narrate) speak(SLIDES[0].say)
  }

  function toggleNarrate() {
    setNarrate(n => {
      const next = !n
      if (!next) stopSpeaking()
      else if (playing) {
        // re-speak current slide when turning voice back on
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel()
            const u = new SpeechSynthesisUtterance(slide.say)
            u.rate = 0.95
            window.speechSynthesis.speak(u)
          } catch {}
        }, 0)
      }
      return next
    })
  }

  const progress = Math.min(100, (elapsed / duration) * 100)

  // ── Start screen ──
  if (!started) {
    return (
      <div style={shell}>
        <div style={{ textAlign: 'center', maxWidth: 620, padding: '0 24px' }}>
          <div style={{ fontSize: 80, marginBottom: 12 }}>📺</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            How to use Papa App
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(18px, 2.4vw, 24px)', lineHeight: 1.5, margin: '0 0 36px' }}>
            A short, simple guide. It plays by itself with big captions.
            You can pause, replay, or skip to any part any time.
          </p>
          <button onClick={start} style={bigPrimaryBtn}>▶  Start the guide</button>
          {canSpeak && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 26, color: 'rgba(255,255,255,0.6)', fontSize: 17, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={narrate}
                onChange={() => setNarrate(n => !n)}
                style={{ width: 22, height: 22, accentColor: GOLD }}
              />
              Read the captions out loud (for helpers — Papa can read along)
            </label>
          )}
          <div style={{ marginTop: 30 }}>
            <Link href="/display" style={{ color: 'rgba(240,165,0,0.7)', fontSize: 16, textDecoration: 'none' }}>
              ← Skip to my screen
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Player ──
  return (
    <div style={shell}>
      <div className="guide-wrap" style={{ display: 'flex', width: '100%', height: '100dvh', flexDirection: 'row' }}>

        {/* Stage (the "video") */}
        <div className="guide-stage" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid rgba(240,165,0,0.12)' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              How to use Papa App
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'sans-serif' }}>
              {index + 1} of {SLIDES.length}
            </span>
          </div>

          {/* caption area */}
          <div key={index} className="guide-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 40px', overflowY: 'auto' }}>
            <div style={{ fontSize: 'clamp(56px, 9vw, 104px)', lineHeight: 1, marginBottom: 22 }}>{slide.icon}</div>
            <h2 style={{ color: GOLD, fontSize: 'clamp(30px, 4.6vw, 54px)', margin: '0 0 18px', lineHeight: 1.12, fontWeight: 800, fontFamily: 'sans-serif', maxWidth: 900 }}>
              {slide.title}
            </h2>
            <p style={{ color: '#fff', fontSize: 'clamp(20px, 2.9vw, 32px)', lineHeight: 1.45, margin: 0, maxWidth: 820, fontFamily: 'Georgia, serif' }}>
              {slide.body}
            </p>
            {slide.demo && <Demo kind={slide.demo} />}
          </div>

          {/* progress bar */}
          <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: GOLD, transition: `width ${TICK}ms linear` }} />
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 16px 24px', flexWrap: 'wrap' }}>
            <button onClick={() => goTo(index - 1)} disabled={index === 0} style={ctrlBtn(index === 0)} aria-label="Previous">⏮</button>
            <button onClick={togglePlay} style={playBtn} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={() => goTo(index + 1)} disabled={isLast} style={ctrlBtn(isLast)} aria-label="Next">⏭</button>
            <button onClick={() => goTo(0)} style={ctrlBtn(false)} aria-label="Replay from start" title="Replay">⟳</button>
            {canSpeak && (
              <button onClick={toggleNarrate} style={{ ...ctrlBtn(false), fontSize: 20 }} aria-label={narrate ? 'Mute voice' : 'Turn voice on'} title={narrate ? 'Voice on — tap to mute' : 'Voice off — tap to turn on'}>
                {narrate ? '🔊' : '🔇'}
              </button>
            )}
          </div>
        </div>

        {/* Skip-to panel */}
        <aside className="guide-panel" style={{ width: 320, background: 'rgba(0,0,0,0.35)', borderLeft: '1px solid rgba(240,165,0,0.14)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 22px 12px', color: GOLD, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'sans-serif' }}>
            Skip to…
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 18px' }}>
            {CHAPTERS.map(c => {
              const active = slide.ch === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => goTo(CHAPTER_START[c.id])}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                    textAlign: 'left', cursor: 'pointer', marginBottom: 8,
                    padding: '15px 16px', borderRadius: 14,
                    border: active ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
                    background: active ? 'rgba(240,165,0,0.16)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#fff' : 'rgba(255,255,255,0.78)',
                    fontSize: 18, fontWeight: active ? 700 : 500, fontFamily: 'sans-serif',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '14px 18px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link href="/display" style={{ display: 'block', textAlign: 'center', background: GOLD, color: '#1a1410', borderRadius: 12, padding: '14px', fontSize: 18, fontWeight: 800, textDecoration: 'none', fontFamily: 'sans-serif' }}>
              Go to my screen →
            </Link>
          </div>
        </aside>
      </div>

      <style>{`
        .guide-slide { animation: guideFade 0.4s ease; }
        @keyframes guideFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(240,165,0,0.25); border-radius: 8px; }
        @media (max-width: 880px) {
          .guide-wrap { flex-direction: column !important; height: auto !important; min-height: 100dvh; }
          .guide-panel { width: 100% !important; border-left: none !important; border-top: 1px solid rgba(240,165,0,0.14); }
          .guide-panel nav { display: flex; flex-wrap: wrap; gap: 8px; }
          .guide-panel nav button { width: auto !important; flex: 1 1 44%; margin-bottom: 0 !important; }
        }
      `}</style>
    </div>
  )
}

/* ── A small mock of the real on-screen control for the current step ── */
function Demo({ kind }) {
  const box = { marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }

  if (kind === 'home') {
    return (
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,0.15)', border: `1.5px solid rgba(74,222,128,0.5)`, borderRadius: 40, padding: '12px 24px' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
          <span style={{ color: GREEN, fontSize: 19, fontWeight: 600, fontFamily: 'sans-serif' }}>Papa is home</span>
        </div>
      </div>
    )
  }
  if (kind === 'listenpill') {
    return (
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(240,165,0,0.12)', border: `1.5px solid rgba(240,165,0,0.4)`, color: GOLD, borderRadius: 40, padding: '12px 26px', fontSize: 19, fontWeight: 600, fontFamily: 'sans-serif' }}>
          🎧 Listen Mode
        </div>
      </div>
    )
  }
  if (kind === 'listenbtn') {
    return (
      <div style={box}>
        <div style={{ padding: '20px 40px', fontSize: 26, fontWeight: 700, background: `linear-gradient(135deg, ${GOLD}, #d98a00)`, color: '#1a1410', borderRadius: 18, fontFamily: 'sans-serif', boxShadow: `0 10px 32px rgba(240,165,0,0.35)` }}>
          🎙  Listen
        </div>
      </div>
    )
  }
  if (kind === 'stopbtn') {
    return (
      <div style={box}>
        <div style={{ padding: '20px 44px', fontSize: 26, fontWeight: 700, background: `linear-gradient(135deg, ${RED}, #dc2626)`, color: '#fff', borderRadius: 18, fontFamily: 'sans-serif', boxShadow: `0 10px 32px rgba(239,68,68,0.4)` }}>
          ⏹  Stop
        </div>
      </div>
    )
  }
  if (kind === 'gear') {
    return (
      <div style={box}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: `2px solid rgba(240,165,0,0.55)`, color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚙</div>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, fontFamily: 'sans-serif' }}>← in the bottom-right corner</span>
      </div>
    )
  }
  if (kind === 'sizecolor') {
    const dots = ['#ffffff', '#fde68a', '#bae6fd', '#bbf7d0', '#fed7aa']
    return (
      <div style={{ ...box, gap: 16, background: 'rgba(15,14,12,0.92)', border: '1px solid rgba(240,165,0,0.22)', borderRadius: 14, padding: '14px 20px', display: 'inline-flex', marginTop: 30 }}>
        <span style={{ ...chipBtn, fontSize: 17 }}>A−</span>
        <span style={{ ...chipBtn, fontSize: 21 }}>A+</span>
        <span style={{ width: 1, height: 26, background: 'rgba(240,165,0,0.2)' }} />
        {dots.map(d => <span key={d} style={{ width: 26, height: 26, borderRadius: '50%', background: d, border: '1px solid rgba(255,255,255,0.25)' }} />)}
      </div>
    )
  }
  if (kind === 'notify') {
    return (
      <div style={box}>
        <div style={{ background: 'rgba(240,165,0,0.15)', border: `1px solid rgba(240,165,0,0.35)`, color: GOLD, borderRadius: 24, padding: '12px 22px', fontSize: 19, fontWeight: 600, fontFamily: 'sans-serif' }}>
          🔔 Notify me
        </div>
      </div>
    )
  }
  if (kind === 'qr') {
    return (
      <div style={{ ...box, flexDirection: 'column', gap: 12, marginTop: 26 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 18, boxShadow: '0 10px 32px rgba(0,0,0,0.4)' }}>
          <img src="/qr-talk.png" alt="QR code to send Papa a message" width={220} height={220} style={{ display: 'block', width: 220, height: 220 }} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, fontFamily: 'sans-serif' }}>Point your phone camera here</span>
      </div>
    )
  }
  if (kind === 'mic') {
    return (
      <div style={{ ...box, flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg, #1a1510, #2a2520)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>🎙️</div>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'sans-serif' }}>Hold to talk</span>
      </div>
    )
  }
  if (kind === 'messages') {
    return (
      <div style={{ marginTop: 30, textAlign: 'left', maxWidth: 560, width: '100%' }}>
        <div style={{ opacity: 0.4, marginBottom: 10 }}>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'sans-serif' }}>SARAH</div>
          <div style={{ color: '#fff', fontSize: 22, fontFamily: 'Georgia, serif' }}>See you Sunday!</div>
        </div>
        <div>
          <div style={{ color: GOLD, fontSize: 15, letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'sans-serif' }}>EMMA</div>
          <div style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 40px)', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>I love you, Papa!</div>
        </div>
      </div>
    )
  }
  return null
}

const shell = {
  minHeight: '100dvh',
  background: '#0f0e0c',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'sans-serif',
  color: '#fff',
}

const bigPrimaryBtn = {
  background: `linear-gradient(135deg, ${GOLD}, #d98a00)`,
  color: '#1a1410',
  border: 'none',
  borderRadius: 18,
  padding: '22px 48px',
  fontSize: 26,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  boxShadow: `0 12px 40px rgba(240,165,0,0.35)`,
}

const playBtn = {
  width: 76, height: 76, borderRadius: '50%',
  background: GOLD, color: '#1a1410', border: 'none',
  fontSize: 32, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  boxShadow: `0 8px 24px rgba(240,165,0,0.4)`,
}

function ctrlBtn(disabled) {
  return {
    width: 60, height: 60, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(240,165,0,0.3)',
    color: disabled ? 'rgba(255,255,255,0.2)' : GOLD,
    fontSize: 24, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

const chipBtn = {
  background: 'transparent',
  border: `1px solid rgba(240,165,0,0.3)`,
  color: 'rgba(240,165,0,0.85)',
  borderRadius: 8,
  padding: '6px 12px',
  fontWeight: 600,
  fontFamily: 'sans-serif',
}
