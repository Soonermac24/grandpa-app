import webpush from 'web-push'
import { supabase } from '../../../lib/supabase-server'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(req) {
  try {
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
