import webpush from 'web-push'
import { supabase } from '../../../lib/supabase-server'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(req) {
  try {
    const { type, message, sender } = await req.json()
    // type: 'papa_home' | 'new_message'

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
    } else {
      return Response.json({ error: 'Unknown type' }, { status: 400 })
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('type', targetType)

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
