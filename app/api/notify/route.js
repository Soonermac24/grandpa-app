import webpush from 'web-push'
import { supabase } from '../../../lib/supabase-server'

// web-push requires the VAPID "subject" to be a mailto: or https: URL,
// not a bare email. Normalize whatever's in the env so a plain address
// like "papa@example.com" still works.
function vapidSubject() {
  const raw = (process.env.VAPID_EMAIL || '').trim()
  if (!raw) return 'mailto:support@papa-app.local'
  if (raw.startsWith('mailto:') || raw.startsWith('http')) return raw
  return `mailto:${raw}`
}

// Configure lazily on first send (and only once) rather than at import.
// Doing it at module load crashed `next build`'s page-data collection
// when the env was missing/invalid.
let vapidReady = false
function ensureVapid() {
  if (vapidReady) return true
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails(vapidSubject(), pub, priv)
  vapidReady = true
  return true
}

export async function POST(req) {
  try {
    if (!ensureVapid()) {
      return Response.json({ error: 'Push notifications are not configured' }, { status: 503 })
    }
    const { type, message, sender, minutes } = await req.json()
    // type: 'papa_home' | 'new_message' | 'usage_spike'

    let targetType, payload

    if (type === 'papa_home') {
      targetType = 'family'
      payload = JSON.stringify({
        title: '🏠 Papa is home!',
        body: 'Tap to say hi',
        url: '/talk',
      })
    } else if (type === 'new_message') {
      targetType = 'papa'
      payload = JSON.stringify({
        title: `📩 ${sender}`,
        body: message,
        url: '/read',
      })
    } else if (type === 'usage_spike') {
      targetType = null // broadcast to all subscribers
      const mins = Number(minutes) || 0
      const estCost = (mins * 0.006).toFixed(2)
      payload = JSON.stringify({
        title: '⚠️ Whisper usage spike',
        body: `${mins} min transcribed in the last hour (~$${estCost})`,
        url: '/read',
      })
    } else {
      return Response.json({ error: 'Unknown type' }, { status: 400 })
    }

    let query = supabase.from('push_subscriptions').select('subscription')
    if (targetType) query = query.eq('type', targetType)
    const { data: subs } = await query

    if (!subs?.length) return Response.json({ sent: 0 })

    const results = await Promise.allSettled(
      subs.map(row => webpush.sendNotification(JSON.parse(row.subscription), payload))
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    return Response.json({ sent })
  } catch (err) {
    console.error('Notify error:', err)
    return Response.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
