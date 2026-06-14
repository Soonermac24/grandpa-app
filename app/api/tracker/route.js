import { supabase } from '../../../lib/supabase-server'

// Private usage tracker — owner only. Gated by TRACKER_PASSCODE (set in
// Vercel env). Without that env var the endpoint stays closed (503), so
// it can never be wide open by accident.

const RATE_PER_MIN = 0.006 // OpenAI Whisper ≈ $0.006 / minute

export async function POST(req) {
  const expected = process.env.TRACKER_PASSCODE
  if (!expected) {
    return Response.json({ error: 'Tracker is not configured yet.' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  if (!body.passcode || body.passcode !== expected) {
    return Response.json({ error: 'Wrong passcode.' }, { status: 401 })
  }

  const { data, error } = await supabase.rpc('tracker_stats')
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const usage = data?.usage || {}
  const min = (s) => (Number(s) || 0) / 60
  const totalMin = min(usage.total_seconds)
  const min7 = min(usage.seconds_7d)
  const min30 = min(usage.seconds_30d)

  const bySource = (usage.by_source || []).map((s) => ({
    source: s.source,
    minutes: min(s.seconds),
    minutes30d: min(s.seconds_30d),
    chunks: Number(s.chunks) || 0,
    cost: min(s.seconds) * RATE_PER_MIN,
  }))

  const costs = {
    ratePerMin: RATE_PER_MIN,
    totalMinutes: totalMin,
    totalCost: totalMin * RATE_PER_MIN,
    cost30d: min30 * RATE_PER_MIN,
    // Project a full month from the last 7 days of activity.
    projectedMonthly: (min7 / 7) * 30 * RATE_PER_MIN,
  }

  return Response.json({ stats: data, costs, bySource })
}
