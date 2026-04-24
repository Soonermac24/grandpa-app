-- ============================================================
-- Papa App — Supabase Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender text not null,
  text text not null,
  created_at timestamp with time zone default now()
);

-- Auto-delete messages older than 7 days (keeps DB tiny forever)
create or replace function delete_old_messages()
returns void language sql as $$
  delete from messages where created_at < now() - interval '7 days';
$$;

-- Presence table (single row, id=1)
create table if not exists presence (
  id integer primary key default 1,
  is_home boolean default false,
  updated_at timestamp with time zone default now()
);

-- Seed the single presence row
insert into presence (id, is_home)
values (1, false)
on conflict (id) do nothing;

-- Push subscriptions table
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text unique not null,
  subscription text not null,
  type text not null check (type in ('papa', 'family')),
  updated_at timestamp with time zone default now()
);

-- Usage log: one row per Whisper call, used for spike-alert detection
create table if not exists usage_log (
  id uuid default gen_random_uuid() primary key,
  kind text not null,
  audio_seconds numeric default 0,
  created_at timestamp with time zone default now()
);
create index if not exists usage_log_kind_created_at_idx
  on usage_log (kind, created_at desc);

-- Alert log: rate-limits spike alerts so we don't spam notifications
create table if not exists alert_log (
  id uuid default gen_random_uuid() primary key,
  kind text not null,
  created_at timestamp with time zone default now()
);
create index if not exists alert_log_kind_created_at_idx
  on alert_log (kind, created_at desc);

-- Enable Realtime on messages and presence
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table presence;

-- Row-level security (allow all for now — lock down after launch if needed)
alter table messages enable row level security;
alter table presence enable row level security;
alter table push_subscriptions enable row level security;
alter table usage_log enable row level security;
alter table alert_log enable row level security;

create policy "Allow all messages" on messages for all using (true) with check (true);
create policy "Allow all presence" on presence for all using (true) with check (true);
create policy "Allow all push" on push_subscriptions for all using (true) with check (true);
create policy "Allow all usage_log" on usage_log for all using (true) with check (true);
create policy "Allow all alert_log" on alert_log for all using (true) with check (true);
