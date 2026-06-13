'use client'
/**
 * Visual mockups for the /guide tutorial.
 *
 * Each scene is a recognizable recreation of a real screen in the app
 * (or an iPhone/Settings screen). The `highlight` prop names one control
 * to circle with a pulsing gold ring (the `ring()` helper) so the
 * narration can point right at it: "tap THIS button."
 *
 * Sizes are in vh so a scene scales to the space the player gives it.
 */

const DARK = '#0f0e0c'
const CREAM = '#faf7f2'
const GOLD = '#f0a500'
const GREEN = '#4ade80'
const RED = '#ef4444'

// Pulsing ring around the element being explained.
export function ring(on) {
  return on ? { animation: 'guideRing 1.5s ease-in-out infinite', borderRadius: 14, position: 'relative', zIndex: 3 } : {}
}

const serif = 'Georgia, "Times New Roman", serif'
const sans = 'sans-serif'

/* ── Device frames ─────────────────────────────────────────────── */

function Phone({ children, bg = '#000' }) {
  return (
    <div style={{
      position: 'relative', height: 'min(46vh, 440px)', aspectRatio: '252 / 520',
      background: '#0a0a0a', borderRadius: 40, padding: 9, flexShrink: 0,
      boxShadow: '0 18px 50px rgba(0,0,0,0.55), inset 0 0 0 2px #2c2c2e',
    }}>
      <div style={{ height: '100%', borderRadius: 32, overflow: 'hidden', background: bg, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* notch */}
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: '34%', height: 18, background: '#0a0a0a', borderRadius: 12, zIndex: 6 }} />
        {children}
      </div>
    </div>
  )
}

function StatusBar({ dark }) {
  const c = dark ? 'rgba(255,255,255,0.85)' : '#1a1410'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px 2px', fontSize: 11, fontWeight: 700, color: c, fontFamily: sans }}>
      <span>9:41</span>
      <span style={{ letterSpacing: 1 }}>● ● ● ▮</span>
    </div>
  )
}

function Monitor({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{
        width: 'min(86vw, 600px)', aspectRatio: '16 / 10',
        background: DARK, borderRadius: 14, padding: 10,
        border: '3px solid #1c1c1c', boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
      <div style={{ width: 70, height: 12, background: '#1c1c1c', borderRadius: '0 0 6px 6px' }} />
      <div style={{ width: 150, height: 8, background: '#161616', borderRadius: 6 }} />
    </div>
  )
}

/* ── Shared pieces ─────────────────────────────────────────────── */

const pillGold = { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(240,165,0,0.14)', border: '1.5px solid rgba(240,165,0,0.45)', color: GOLD, borderRadius: 30, padding: '6px 12px', fontSize: 'clamp(9px,1.3vw,12px)', fontWeight: 600, fontFamily: sans }
const pillGhost = { ...pillGold, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(240,165,0,0.25)', color: 'rgba(240,165,0,0.85)' }
const homeBadge = { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.15)', border: '1.5px solid rgba(74,222,128,0.5)', borderRadius: 30, padding: '6px 12px' }

function Msg({ sender, text, big, color = '#fff' }) {
  return (
    <div style={{ marginBottom: big ? 0 : 10, opacity: big ? 1 : 0.45 }}>
      <div style={{ color: GOLD, fontSize: big ? 'clamp(9px,1.2vw,12px)' : 9, letterSpacing: '0.14em', fontWeight: 700, fontFamily: sans, marginBottom: 2 }}>{sender}</div>
      <div style={{ color, fontSize: big ? 'clamp(20px,3.4vw,38px)' : 'clamp(12px,1.8vw,18px)', fontFamily: serif, lineHeight: 1.2 }}>{text}</div>
    </div>
  )
}

/* ── The scene dispatcher ──────────────────────────────────────── */

export default function GuideScene({ name, highlight }) {
  switch (name) {

    /* Papa's big home screen */
    case 'display':
      return (
        <Monitor>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(240,165,0,0.12)' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: sans }}>Family Messages</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ ...pillGold, ...ring(highlight === 'sendmsg') }}>📷 Send me a message</span>
              <span style={{ ...pillGhost, ...ring(highlight === 'guide') }}>❔ How to use this</span>
              <span style={{ ...pillGold, ...ring(highlight === 'listen') }}>🎧 Listen Mode</span>
            </div>
            <div style={{ ...homeBadge, ...ring(highlight === 'home') }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
              <span style={{ color: GREEN, fontSize: 'clamp(9px,1.3vw,12px)', fontWeight: 600, fontFamily: sans }}>Papa is home</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <Msg sender="SARAH" text="See you Sunday!" />
            <div style={ring(highlight === 'message')}>
              <Msg sender="EMMA" text="I love you, Papa!" big />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 8, right: 10, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(240,165,0,0.5)', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, ...ring(highlight === 'gear') }}>⚙</div>
        </Monitor>
      )

    /* The settings popover (text size + color) */
    case 'settings': {
      const dots = ['#ffffff', '#fde68a', '#bae6fd', '#bbf7d0', '#fed7aa']
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(15,14,12,0.96)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 18, padding: '18px 24px', flexShrink: 0 }}>
          <span style={{ ...chip, fontSize: 18, ...ring(highlight === 'aplus' && false) }}>A−</span>
          <span style={{ ...chip, fontSize: 24, ...ring(highlight === 'aplus') }}>A+</span>
          <span style={{ width: 1, height: 30, background: 'rgba(240,165,0,0.25)' }} />
          <div style={{ display: 'flex', gap: 8, ...ring(highlight === 'colors') }}>
            {dots.map(d => <span key={d} style={{ width: 30, height: 30, borderRadius: '50%', background: d, border: '1px solid rgba(255,255,255,0.3)' }} />)}
          </div>
        </div>
      )
    }

    /* Family "Talk" — name entry */
    case 'talk-name':
      return (
        <Phone bg={CREAM}>
          <StatusBar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 22, fontFamily: sans }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>👋</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#1a1410', marginBottom: 4 }}>Talk to Papa</div>
            <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 22 }}>Enter your name so he knows who’s sending</div>
            <div style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #e8e0d0', background: '#fff', color: '#1a1410', fontSize: 16, textAlign: 'center', ...ring(highlight === 'name') }}>Emma|</div>
            <div style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 12, background: GOLD, color: '#fff', fontSize: 14, fontWeight: 800, textAlign: 'center' }}>Let’s go →</div>
          </div>
        </Phone>
      )

    /* Family "Talk" — hold to talk */
    case 'talk':
      return (
        <Phone bg={CREAM}>
          <StatusBar />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px', fontFamily: sans }}>
            <span style={{ color: '#bbb', fontSize: 12 }}>← Emma</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} /> Papa is home
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1510,#2a2520)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', ...ring(highlight === 'mic') }}>🎙️</div>
            <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', fontFamily: sans }}>HOLD TO TALK</div>
          </div>
        </Phone>
      )

    /* Papa's phone reader */
    case 'read':
      return (
        <Phone bg={DARK}>
          <StatusBar dark />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px 8px', fontFamily: sans }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Messages</span>
            <span style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.35)', color: GOLD, borderRadius: 20, padding: '5px 11px', fontSize: 11, fontWeight: 600, ...ring(highlight === 'notify') }}>🔔 Notify me</span>
          </div>
          <div style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <Msg sender="SARAH" text="See you Sunday!" />
            <div style={ring(highlight === 'message')}>
              <Msg sender="EMMA" text="I love you, Papa!" big />
            </div>
          </div>
        </Phone>
      )

    /* Listen Mode */
    case 'listen':
      return (
        <Phone bg="#000">
          <StatusBar dark />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px', fontFamily: sans }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>← Display</span>
            <span style={{ color: highlight === 'stopbtn' ? RED : 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 700 }}>
              {highlight === 'stopbtn' ? '● Listening' : 'Listen Mode'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Clear</span>
          </div>
          <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {highlight === 'stopbtn'
              ? <div style={{ color: '#fff', fontSize: 'clamp(20px,3vw,30px)', fontWeight: 500, lineHeight: 1.3 }}>Would you like some coffee?</div>
              : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center', lineHeight: 1.5 }}>Tap <b style={{ color: '#fff' }}>Listen</b> to start<br />transcribing the conversation around you.</div>}
          </div>
          <div style={{ padding: '14px 18px 20px' }}>
            {highlight === 'stopbtn'
              ? <div style={{ padding: '16px', fontSize: 18, fontWeight: 700, background: `linear-gradient(135deg,${RED},#dc2626)`, color: '#fff', borderRadius: 14, textAlign: 'center', fontFamily: sans, ...ring(true) }}>⏹  Stop</div>
              : <div style={{ padding: '16px', fontSize: 18, fontWeight: 700, background: `linear-gradient(135deg,${GOLD},#d98a00)`, color: '#1a1410', borderRadius: 14, textAlign: 'center', fontFamily: sans, ...ring(highlight === 'listenbtn') }}>🎙  Listen</div>}
          </div>
        </Phone>
      )

    /* The QR code to message Papa */
    case 'qr':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 18, boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}>
            <img src="/qr-talk.png" alt="QR code to message Papa" style={{ display: 'block', width: 'min(40vh, 260px)', height: 'min(40vh, 260px)' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, fontFamily: sans }}>Point your phone camera here 📷</span>
        </div>
      )

    /* iPhone home screen with the Huh? app icon */
    case 'phonehome': {
      const others = ['📷', '🗓️', '🌤️', '📝', '🎵', '🗺️', '⏰', '📺']
      return (
        <Phone bg="linear-gradient(160deg,#3a4a6b,#1f2a44)">
          <StatusBar dark />
          <div style={{ flex: 1, padding: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px 10px', alignContent: 'start' }}>
            {others.slice(0, 4).map((e, i) => <AppIcon key={i} emoji={e} />)}
            <AppIcon huh label="Huh?" highlighted={highlight === 'icon'} />
            {others.slice(4).map((e, i) => <AppIcon key={i + 99} emoji={e} />)}
          </div>
        </Phone>
      )
    }

    /* Safari showing the app, with the Share button to tap */
    case 'safari-share':
      return (
        <Phone bg={CREAM}>
          <StatusBar />
          <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#e5e0d6', borderRadius: 9, padding: '6px 14px', fontSize: 11, color: '#555', fontFamily: sans, width: '90%', textAlign: 'center' }}>🔒 grandpa-app-roan.vercel.app</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: sans, color: '#1a1410' }}>
            <div style={{ fontSize: 36 }}>👋</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Talk to Papa</div>
          </div>
          {/* Safari bottom toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 6px', borderTop: '1px solid #ddd', background: '#f3f0ea', color: '#3478f6', fontSize: 17 }}>
            <span>‹</span><span>›</span>
            <span style={{ ...ring(highlight === 'share'), padding: '2px 8px' }}>⬆️</span>
            <span>📖</span><span>❐</span>
          </div>
        </Phone>
      )

    /* iOS Share sheet with "Add to Home Screen" */
    case 'share-sheet':
      return (
        <Phone bg="#1c1c1e">
          <StatusBar dark />
          <div style={{ flex: 1 }} />
          <div style={{ background: '#2c2c2e', borderRadius: '16px 16px 0 0', padding: '14px 14px 22px', fontFamily: sans }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Talk to Papa</div>
            <Row icon="📋" label="Copy" />
            <Row icon="➕" label="Add to Home Screen" highlighted={highlight === 'a2hs'} accent />
            <Row icon="🔖" label="Add Bookmark" />
            <Row icon="🔗" label="Copy Link" />
          </div>
        </Phone>
      )

    /* iOS Settings list → Accessibility */
    case 'settings-app':
      return (
        <Phone bg="#000">
          <StatusBar dark />
          <div style={{ padding: '6px 16px 10px', color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: sans }}>Settings</div>
          <div style={{ flex: 1, padding: '0 12px' }}>
            <SettingRow icon="✈️" label="Airplane Mode" />
            <SettingRow icon="📶" label="Wi-Fi" />
            <SettingRow icon="🔔" label="Notifications" />
            <SettingRow icon="♿" label="Accessibility" iconBg="#0a84ff" highlighted={highlight === 'accessibility'} />
            <SettingRow icon="🔋" label="Battery" />
          </div>
        </Phone>
      )

    /* iOS Live Captions toggle */
    case 'live-captions':
      return (
        <Phone bg="#000">
          <StatusBar dark />
          <div style={{ padding: '6px 16px', color: '#0a84ff', fontSize: 13, fontFamily: sans }}>‹ Accessibility</div>
          <div style={{ padding: '4px 16px 14px', color: '#fff', fontSize: 21, fontWeight: 800, fontFamily: sans }}>Live Captions</div>
          <div style={{ padding: '0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1c1c1e', borderRadius: 12, padding: '12px 14px', fontFamily: sans, ...ring(highlight === 'toggle') }}>
              <span style={{ color: '#fff', fontSize: 14 }}>Live Captions</span>
              <span style={{ width: 44, height: 26, borderRadius: 14, background: GREEN, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: '#fff' }} />
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, padding: '10px 6px', fontFamily: sans, lineHeight: 1.5 }}>
              Live Captions show on-screen text of spoken audio — in calls, FaceTime, and around you.
            </div>
          </div>
        </Phone>
      )

    /* FaceTime call with the caption box */
    case 'facetime':
      return (
        <Phone bg="linear-gradient(160deg,#2a2333,#14101b)">
          <StatusBar dark />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: sans }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#f0a500,#d98a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>🧑</div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 8 }}>Emma</div>
            {/* picture-in-picture self */}
            <div style={{ position: 'absolute', top: 36, right: 12, width: 46, height: 64, borderRadius: 10, background: '#3a3340', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👴</div>
          </div>
          {/* caption box */}
          <div style={{ margin: '0 12px', borderRadius: 12, background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 12px', ...ring(highlight === 'captionbox') }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, fontFamily: sans }}>Live Captions</div>
            <div style={{ color: '#fff', fontSize: 14, fontFamily: sans, marginTop: 3 }}>Hi Papa, can you hear me okay?</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, padding: '14px 0 18px', fontSize: 18 }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔇</span>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</span>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</span>
          </div>
        </Phone>
      )

    default:
      return null
  }
}

/* ── small bits used above ─────────────────────────────────────── */

const chip = { background: 'transparent', border: '1px solid rgba(240,165,0,0.35)', color: 'rgba(240,165,0,0.9)', borderRadius: 8, padding: '6px 12px', fontWeight: 600, fontFamily: sans }

function AppIcon({ emoji, huh, label, highlighted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: '100%', aspectRatio: '1', maxWidth: 46, borderRadius: 12, overflow: 'hidden', background: huh ? '#fff' : 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, ...ring(highlighted) }}>
        {huh ? <img src="/icon-huh-blue-192.png" alt="Huh?" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : emoji}
      </div>
      {(label || !huh) && <span style={{ fontSize: 9, color: '#fff', fontFamily: sans, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{label || ''}</span>}
    </div>
  )
}

function Row({ icon, label, highlighted, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#3a3a3c', borderRadius: 12, padding: '12px 14px', marginBottom: 8, ...ring(highlighted) }}>
      <span style={{ color: accent && highlighted ? GOLD : '#fff', fontSize: 14, fontWeight: highlighted ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 16 }}>{icon}</span>
    </div>
  )
}

function SettingRow({ icon, label, iconBg = '#8e8e93', highlighted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1c1c1e', borderRadius: 12, padding: '10px 12px', marginBottom: 8, ...ring(highlighted) }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</span>
      <span style={{ color: '#fff', fontSize: 14, fontWeight: highlighted ? 700 : 400, flex: 1 }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
    </div>
  )
}
