import OpenAI from 'openai'
import { supabase } from '../../../lib/supabase-server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Spike = more than this much Whisper audio in the rolling 60-min window.
// Whisper pricing ≈ $0.006/min, so 15 min ≈ $0.09/hour spend rate.
const SPIKE_MINUTES_PER_HOUR = 15
const ALERT_COOLDOWN_MINUTES = 120

async function checkForSpikeAndAlert(req) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: usage } = await supabase
    .from('usage_log')
    .select('audio_seconds')
    .eq('kind', 'transcribe')
    .gte('created_at', oneHourAgo)

  if (!usage?.length) return

  const totalSeconds = usage.reduce((s, r) => s + (Number(r.audio_seconds) || 0), 0)
  const totalMinutes = totalSeconds / 60
  if (totalMinutes < SPIKE_MINUTES_PER_HOUR) return

  const cooldownAgo = new Date(Date.now() - ALERT_COOLDOWN_MINUTES * 60 * 1000).toISOString()
  const { data: recentAlerts } = await supabase
    .from('alert_log')
    .select('id')
    .eq('kind', 'usage_spike')
    .gte('created_at', cooldownAgo)
    .limit(1)
  if (recentAlerts?.length) return

  await supabase.from('alert_log').insert({ kind: 'usage_spike' })

  const origin = new URL(req.url).origin
  await fetch(`${origin}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'usage_spike',
      minutes: Number(totalMinutes.toFixed(1)),
    }),
  }).catch(err => console.error('Spike notify failed:', err))
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio')

    if (!audio) {
      return Response.json({ error: 'No audio received' }, { status: 400 })
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
    })

    const duration = Number(transcription.duration) || 0
    supabase
      .from('usage_log')
      .insert({ kind: 'transcribe', audio_seconds: duration })
      .then(({ error }) => { if (error) console.error('usage_log insert:', error) })

    checkForSpikeAndAlert(req).catch(err => console.error('Spike check failed:', err))

    return Response.json({ text: transcription.text })
  } catch (err) {
    console.error('Transcription error:', err)
    return Response.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
