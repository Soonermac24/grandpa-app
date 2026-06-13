'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import GuideScene from './scenes'

/**
 * /guide — a captioned, narrated "video" that teaches the Papa App.
 *
 * Plays like a slideshow video: each step shows a recreation of the
 * real screen with the exact button circled (a pulsing gold ring), big
 * captions, a progress bar, and play/pause/replay. A "Skip to…" panel
 * on the right jumps to any chapter.
 *
 * Captions are the star (Papa is hard of hearing). Narration (the
 * browser's built-in voice) is an extra for great-grandkids / helpers
 * reading along — easy to mute.
 */

const GOLD = '#f0a500'

// scene = a screen mockup to show; highlight = the control to circle.
// device-less slides (no scene) show a big emoji as a chapter opener.
const SLIDES = [
  {
    ch: 'welcome', icon: '👋',
    title: 'Welcome to Papa App',
    body: 'This guide shows you what each screen looks like and points at exactly what to tap. Let’s go through it together.',
    say: 'Welcome to Papa App. This guide shows you what each screen looks like, and points at exactly what to tap. Let us go through it together.',
  },

  // ── Reading messages ──
  {
    ch: 'reading', scene: 'display', highlight: 'message',
    title: 'Your family’s messages appear here',
    body: 'This is your Home screen. When family sends a message it shows up big, right here. The newest one is the largest, near the bottom.',
    say: 'This is your home screen. When family sends a message, it shows up here in big letters. The newest message is the largest one, near the bottom.',
  },
  {
    ch: 'reading', scene: 'display', highlight: 'home',
    title: 'The green “Papa is home” light',
    body: 'When this screen is on, your family sees the green “Papa is home” light (circled). Just leave the screen on — you don’t have to do anything.',
    say: 'When this screen is on, your family sees the green Papa is home light, circled here. Just leave the screen on. You do not have to do anything.',
  },

  // ── Listen Mode ──
  {
    ch: 'listen', scene: 'display', highlight: 'listen',
    title: 'Listen Mode — caption the room',
    body: 'Talking with someone in person? Tap the gold “Listen Mode” button at the top (circled).',
    say: 'Are you talking with someone in person? Tap the gold Listen Mode button at the top, circled here.',
  },
  {
    ch: 'listen', scene: 'listen', highlight: 'listenbtn',
    title: 'Tap the big “Listen” button',
    body: 'Tap the large gold “Listen” button (circled). Now what people say out loud appears on the screen as words, while they talk.',
    say: 'Tap the large gold Listen button, circled here. Now what people say out loud appears on the screen as words, while they talk.',
  },
  {
    ch: 'listen', scene: 'listen', highlight: 'stopbtn',
    title: 'Tap the red “Stop” when finished',
    body: 'When you’re done, tap the red “Stop” button (circled). Then use “← Display” at the top to go back to your messages.',
    say: 'When you are done, tap the red Stop button, circled here. Then use the back link at the top to go back to your messages.',
  },

  // ── Bigger text & color ──
  {
    ch: 'bigger', scene: 'display', highlight: 'gear',
    title: 'Make the words bigger',
    body: 'See the small gear in the bottom-right corner (circled)? Tap it to open your settings.',
    say: 'See the small gear in the bottom right corner, circled here? Tap it to open your settings.',
  },
  {
    ch: 'bigger', scene: 'settings', highlight: 'aplus',
    title: 'Bigger, smaller, or a new color',
    body: 'Tap “A+” to make words bigger (circled), or “A−” for smaller. Tap a colored dot to change the color. The screen remembers what you pick.',
    say: 'Tap the A plus button to make words bigger, circled here. Or A minus for smaller. Tap a colored dot to change the color. The screen remembers what you pick.',
  },

  // ── FaceTime captions on Papa's phone ──
  {
    ch: 'captions', icon: '📞',
    title: 'FaceTime — with captions',
    body: 'Papa can also see what people say during a FaceTime video call, using his iPhone’s “Live Captions.” Here’s how to turn it on — you only do this once.',
    say: 'Papa can also see what people say during a Face Time video call, using his iPhone’s Live Captions. Here is how to turn it on. You only do this once.',
  },
  {
    ch: 'captions', scene: 'settings-app', highlight: 'accessibility',
    title: 'Open Settings → Accessibility',
    body: 'On Papa’s iPhone, open the gray “Settings” app and tap “Accessibility” (circled).',
    say: 'On Papa’s iPhone, open the gray Settings app, and tap Accessibility, circled here.',
  },
  {
    ch: 'captions', scene: 'live-captions', highlight: 'toggle',
    title: 'Turn on “Live Captions”',
    body: 'Scroll down to “Live Captions” and switch it ON (circled — it turns green). That’s the setting that makes spoken words show up as text.',
    say: 'Scroll down to Live Captions, and switch it on, circled here. It turns green. That is the setting that makes spoken words show up as text.',
  },
  {
    ch: 'captions', scene: 'facetime', highlight: 'captionbox',
    title: 'Now FaceTime shows captions',
    body: 'When Papa is on a FaceTime call, a caption box (circled) shows what the other person is saying — so he can read along as they talk.',
    say: 'Now, when Papa is on a Face Time call, a caption box, circled here, shows what the other person is saying. So he can read along as they talk.',
  },

  // ── On your phone (Read) ──
  {
    ch: 'phone', scene: 'read', highlight: 'message',
    title: 'Reading on your phone',
    body: 'Away from home? Open Papa App on your phone and tap “Messages.” The same family messages show up here in big letters.',
    say: 'Are you away from home? Open Papa App on your phone, and tap Messages. The same family messages show up here, in big letters.',
  },
  {
    ch: 'phone', scene: 'read', highlight: 'notify',
    title: 'Get a buzz when family writes',
    body: 'Tap “🔔 Notify me” one time (circled). After that, your phone buzzes whenever family sends you a message.',
    say: 'Tap the Notify me button one time, circled here. After that, your phone buzzes whenever family sends you a message.',
  },

  // ── For family ──
  {
    ch: 'family', icon: '👨‍👩‍👧',
    title: 'For family & great-grandkids',
    body: 'These next steps are for family who want to send Papa a message — from their own phone.',
    say: 'These next steps are for family who want to send Papa a message, from their own phone.',
  },
  {
    ch: 'family', scene: 'qr',
    title: 'Scan the QR code',
    body: 'Open your phone’s camera and point it at this QR code (it’s also on the back of Papa’s screen). Tap the link that pops up.',
    say: 'Open your phone’s camera, and point it at this Q R code. It is also on the back of Papa’s screen. Tap the link that pops up.',
  },
  {
    ch: 'family', scene: 'talk-name', highlight: 'name',
    title: 'Type your name once',
    body: 'The first time, type your name (circled) so Papa knows who’s talking — like “Emma” or “Grandma.” Your phone remembers it after that.',
    say: 'The first time, type your name, circled here, so Papa knows who is talking. Like Emma, or Grandma. Your phone remembers it after that.',
  },
  {
    ch: 'family', scene: 'talk', highlight: 'mic',
    title: 'Hold the button and talk',
    body: 'Press and HOLD the big microphone button (circled), say your message, then let go. Your words pop up on Papa’s screen in seconds.',
    say: 'Press and hold the big microphone button, circled here, say your message, then let go. Your words pop up on Papa’s screen in seconds.',
  },

  // ── Calling Papa while he's home ──
  {
    ch: 'calling', icon: '☎️',
    title: 'Calling Papa when he’s home',
    body: 'Here’s the trick for phone calls: call Papa like normal, and let him read along on his big screen while you talk.',
    say: 'Here is the trick for phone calls. Call Papa like normal, and let him read along on his big screen while you talk.',
  },
  {
    ch: 'calling', scene: 'talk', highlight: 'mic',
    title: 'While on the call, open Papa App',
    body: 'You’re on the phone with Papa. Open the Papa App on your phone too, then press and HOLD the microphone (circled) and say what you’re telling him. Let go to send.',
    say: 'You are on the phone with Papa. Open the Papa App on your phone too. Then press and hold the microphone, circled here, and say what you are telling him. Let go to send.',
  },
  {
    ch: 'calling', scene: 'display', highlight: 'message',
    title: 'Papa reads it on his screen',
    body: 'Your words appear big on Papa’s screen at home (circled). So even on a phone call, he can read along with what you’re saying.',
    say: 'Your words appear big on Papa’s screen at home, circled here. So even on a phone call, he can read along with what you are saying.',
  },

  // ── Add to home screen ──
  {
    ch: 'install', icon: '⬇️',
    title: 'Make it a real app on your phone',
    body: 'You can save Papa App to your phone’s home screen so it opens like a normal app — no need to scan the code each time. Use Safari on iPhone.',
    say: 'You can save Papa App to your phone’s home screen, so it opens like a normal app, with no need to scan the code each time. Use Safari on the iPhone.',
  },
  {
    ch: 'install', scene: 'safari-share', highlight: 'share',
    title: 'In Safari, tap the Share button',
    body: 'Open the page in Safari. Tap the Share button at the bottom — the little square with an arrow pointing up (circled).',
    say: 'Open the page in Safari. Tap the Share button at the bottom. It is the little square with an arrow pointing up, circled here.',
  },
  {
    ch: 'install', scene: 'share-sheet', highlight: 'a2hs',
    title: 'Tap “Add to Home Screen”',
    body: 'In the list that slides up, tap “Add to Home Screen” (circled), then tap “Add.” You can name it “Huh?” so it’s easy to find.',
    say: 'In the list that slides up, tap Add to Home Screen, circled here. Then tap Add. You can name it Huh, so it is easy to find.',
  },
  {
    ch: 'install', scene: 'phonehome', highlight: 'icon',
    title: 'Tap the Huh? app icon',
    body: 'Now the Huh? app icon is on your home screen (circled). Tap it any time to open Papa App — just like a real app.',
    say: 'Now the Huh app icon is on your home screen, circled here. Tap it any time to open Papa App, just like a real app.',
  },

  {
    ch: 'done', icon: '✅',
    title: 'That’s everything!',
    body: 'You’re all set. Watch this again any time with “Replay,” or jump to a part with the “Skip to…” buttons. Tap “Go to my screen” to start.',
    say: 'That is everything. You are all set. Watch this again any time with Replay, or jump to a part with the Skip to buttons.',
  },
]

const CHAPTERS = [
  { id: 'welcome', icon: '👋', label: 'Welcome' },
  { id: 'reading', icon: '💬', label: 'Reading messages' },
  { id: 'listen', icon: '🎧', label: 'Listen Mode' },
  { id: 'bigger', icon: '🔠', label: 'Bigger text & color' },
  { id: 'captions', icon: '📞', label: 'FaceTime captions' },
  { id: 'phone', icon: '📱', label: 'On your phone' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'For family' },
  { id: 'calling', icon: '☎️', label: 'Calling Papa' },
  { id: 'install', icon: '⬇️', label: 'Add to your phone' },
  { id: 'done', icon: '✅', label: 'All done' },
]

const CHAPTER_START = {}
SLIDES.forEach((s, i) => { if (CHAPTER_START[s.ch] === undefined) CHAPTER_START[s.ch] = i })

// Papa's own chapters play slower, so he has more time to read each step.
const PAPA_CHAPTERS = new Set(['welcome', 'reading', 'listen', 'bigger', 'captions', 'phone', 'done'])

function slideDuration(slide) {
  const words = (slide.title + ' ' + slide.body).split(/\s+/).length
  if (PAPA_CHAPTERS.has(slide.ch)) return Math.min(20000, Math.max(10000, words * 560))
  return Math.min(14000, Math.max(7000, words * 420))
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

  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = useCallback((text) => {
    if (!narrate || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      window.speechSynthesis.speak(u)
    } catch {}
  }, [narrate])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch {}
    }
  }, [])

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

  useEffect(() => {
    if (!started || !playing) return
    const id = setInterval(() => {
      setElapsed(prev => {
        const nextElapsed = prev + TICK
        if (nextElapsed >= duration) {
          if (isLast) { setPlaying(false); return duration }
          setTimeout(() => goTo(index + 1), 0)
          return 0
        }
        return nextElapsed
      })
    }, TICK)
    return () => clearInterval(id)
  }, [started, playing, duration, isLast, index, goTo])

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

  useEffect(() => () => stopSpeaking(), [stopSpeaking])

  function togglePlay() {
    if (playing) { setPlaying(false); stopSpeaking() }
    else { setPlaying(true); speak(slide.say) }
  }

  function start() {
    setStarted(true)
    setIndex(0)
    setElapsed(0)
    setPlaying(true)
    if (narrate) speak(SLIDES[0].say)
  }

  function toggleNarrate() {
    setNarrate(n => {
      const next = !n
      if (!next) stopSpeaking()
      else if (playing) {
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

  if (!started) {
    return (
      <div style={shell}>
        <div style={{ textAlign: 'center', maxWidth: 620, padding: '0 24px' }}>
          <div style={{ fontSize: 80, marginBottom: 12 }}>📺</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            How to use Papa App
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(18px, 2.4vw, 24px)', lineHeight: 1.5, margin: '0 0 36px' }}>
            A simple guide. It shows each screen, circles the button to tap,
            and plays by itself. Pause, replay, or skip to any part any time.
          </p>
          <button onClick={start} style={bigPrimaryBtn}>▶  Start the guide</button>
          {canSpeak && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 26, color: 'rgba(255,255,255,0.6)', fontSize: 17, cursor: 'pointer' }}>
              <input type="checkbox" checked={narrate} onChange={() => setNarrate(n => !n)} style={{ width: 22, height: 22, accentColor: GOLD }} />
              Read the captions out loud (for helpers — Papa can read along)
            </label>
          )}
          <div style={{ marginTop: 30 }}>
            <Link href="/display" style={{ color: 'rgba(240,165,0,0.7)', fontSize: 16, textDecoration: 'none' }}>← Skip to my screen</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={shell}>
      <div className="guide-wrap" style={{ display: 'flex', width: '100%', height: '100dvh', flexDirection: 'row' }}>

        <div className="guide-stage" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid rgba(240,165,0,0.12)' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>How to use Papa App</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'sans-serif' }}>{index + 1} of {SLIDES.length}</span>
          </div>

          <div key={index} className="guide-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px 32px', overflowY: 'auto', gap: 14 }}>
            <h2 style={{ color: GOLD, fontSize: 'clamp(24px, 3.6vw, 42px)', margin: 0, lineHeight: 1.12, fontWeight: 800, fontFamily: 'sans-serif', maxWidth: 880 }}>
              {slide.title}
            </h2>

            {slide.scene
              ? <GuideScene name={slide.scene} highlight={slide.highlight} />
              : <div style={{ fontSize: 'clamp(56px, 9vw, 104px)', lineHeight: 1 }}>{slide.icon}</div>}

            <p style={{ color: '#fff', fontSize: 'clamp(17px, 2.3vw, 26px)', lineHeight: 1.4, margin: 0, maxWidth: 760, fontFamily: 'Georgia, serif' }}>
              {slide.body}
            </p>
          </div>

          <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: GOLD, transition: `width ${TICK}ms linear` }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 16px 22px', flexWrap: 'wrap' }}>
            <button onClick={() => goTo(index - 1)} disabled={index === 0} style={ctrlBtn(index === 0)} aria-label="Previous">⏮</button>
            <button onClick={togglePlay} style={playBtn} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '⏸' : '▶'}</button>
            <button onClick={() => goTo(index + 1)} disabled={isLast} style={ctrlBtn(isLast)} aria-label="Next">⏭</button>
            <button onClick={() => goTo(0)} style={ctrlBtn(false)} aria-label="Replay from start" title="Replay">⟳</button>
            {canSpeak && (
              <button onClick={toggleNarrate} style={{ ...ctrlBtn(false), fontSize: 20 }} title={narrate ? 'Voice on — tap to mute' : 'Voice off — tap to turn on'}>
                {narrate ? '🔊' : '🔇'}
              </button>
            )}
          </div>
        </div>

        <aside className="guide-panel" style={{ width: 320, background: 'rgba(0,0,0,0.35)', borderLeft: '1px solid rgba(240,165,0,0.14)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 22px 12px', color: GOLD, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'sans-serif' }}>Skip to…</div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 18px' }}>
            {CHAPTERS.map(c => {
              const active = slide.ch === c.id
              return (
                <button key={c.id} onClick={() => goTo(CHAPTER_START[c.id])} style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 8,
                  padding: '14px 16px', borderRadius: 14,
                  border: active ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(240,165,0,0.16)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.78)',
                  fontSize: 18, fontWeight: active ? 700 : 500, fontFamily: 'sans-serif',
                }}>
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
        @keyframes guideRing {
          0%, 100% { box-shadow: 0 0 0 3px rgba(240,165,0,0.95), 0 0 0 9px rgba(240,165,0,0.25); }
          50%      { box-shadow: 0 0 0 4px rgba(240,165,0,1), 0 0 0 18px rgba(240,165,0,0); }
        }
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

const shell = {
  minHeight: '100dvh', background: '#0f0e0c',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'sans-serif', color: '#fff',
}

const bigPrimaryBtn = {
  background: `linear-gradient(135deg, ${GOLD}, #d98a00)`, color: '#1a1410',
  border: 'none', borderRadius: 18, padding: '22px 48px',
  fontSize: 26, fontWeight: 800, cursor: 'pointer', fontFamily: 'sans-serif',
  boxShadow: `0 12px 40px rgba(240,165,0,0.35)`,
}

const playBtn = {
  width: 76, height: 76, borderRadius: '50%', background: GOLD, color: '#1a1410',
  border: 'none', fontSize: 32, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px rgba(240,165,0,0.4)`,
}

function ctrlBtn(disabled) {
  return {
    width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(240,165,0,0.3)', color: disabled ? 'rgba(255,255,255,0.2)' : GOLD,
    fontSize: 24, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
