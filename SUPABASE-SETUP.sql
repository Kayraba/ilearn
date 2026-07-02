-- iLearn — shared database setup. Run ONCE in the Supabase SQL editor.
create table if not exists public.learners (
  name_key   text primary key,
  name       text,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.learners enable row level security;

-- Controlled-pilot policy: the public anon key may read/write learner rows.
-- This is the same trust level as the app itself. Tighten (add real auth)
-- before storing sensitive personal data.
drop policy if exists "ilearn anon access" on public.learners;
create policy "ilearn anon access" on public.learners
  for all to anon using (true) with check (true);
