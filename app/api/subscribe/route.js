import { supabase } from '../../../lib/supabase-server'

export async function POST(req) {
  try {
    const { subscription, type } = await req.json()
    await supabase.from('push_subscriptions').upsert({
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      type, // 'papa' or 'family'
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return Response.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
