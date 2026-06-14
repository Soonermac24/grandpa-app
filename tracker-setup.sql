-- Tracker setup — run this once in the Supabase SQL editor.
-- Adds a "source" tag to usage_log (talk vs listen) and a function that
-- returns all the tracker numbers in one call (so big Listen-Mode row
-- counts never get truncated).

-- 1. Tag transcriptions with where they came from.
alter table usage_log add column if not exists source text;

create index if not exists usage_log_source_idx on usage_log (source);

-- 2. One function that returns every stat the tracker needs, as JSON.
create or replace function tracker_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'generated_at', now(),
    'messages', json_build_object(
      'total',  (select count(*) from messages),
      'last7',  (select count(*) from messages where created_at >= now() - interval '7 days'),
      'last30', (select count(*) from messages where created_at >= now() - interval '30 days'),
      'by_sender', (
        select coalesce(json_agg(t), '[]'::json) from (
          select sender, count(*) as n, max(created_at) as last_at
          from messages
          group by sender
          order by count(*) desc
        ) t
      ),
      'recent', (
        select coalesce(json_agg(r), '[]'::json) from (
          select sender, text, created_at
          from messages
          order by created_at desc
          limit 30
        ) r
      )
    ),
    'usage', json_build_object(
      'total_seconds', (select coalesce(sum(audio_seconds), 0) from usage_log where kind = 'transcribe'),
      'seconds_7d',    (select coalesce(sum(audio_seconds), 0) from usage_log where kind = 'transcribe' and created_at >= now() - interval '7 days'),
      'seconds_30d',   (select coalesce(sum(audio_seconds), 0) from usage_log where kind = 'transcribe' and created_at >= now() - interval '30 days'),
      'by_source', (
        select coalesce(json_agg(u), '[]'::json) from (
          select
            coalesce(source, 'unknown') as source,
            sum(audio_seconds)                                                              as seconds,
            count(*)                                                                        as chunks,
            sum(audio_seconds) filter (where created_at >= now() - interval '7 days')       as seconds_7d,
            sum(audio_seconds) filter (where created_at >= now() - interval '30 days')      as seconds_30d
          from usage_log
          where kind = 'transcribe'
          group by coalesce(source, 'unknown')
          order by sum(audio_seconds) desc
        ) u
      )
    )
  );
$$;

grant execute on function tracker_stats() to anon, authenticated;
