-- iLearn — shared database setup. Run ONCE in the Supabase SQL editor.
--
-- READ THIS BEFORE RUNNING IT WITH REAL LEARNER DATA.
--
-- This app is a static site. It has no server of its own, so the only
-- credential it can hold is the anon key, and that key ships inside the page to
-- every visitor. The anon key being public is fine and by design — what matters
-- is the row-level security policy below, because that is the *only* thing
-- standing between a visitor and this table.
--
-- A policy permissive enough for the staff dashboard to list every learner is,
-- by construction, permissive enough for anyone who views source to do the
-- same. That is not a bug in the policy; it is what "no backend" means. So:
--
--   * Pilot with fabricated learner names and no real support notes, OR
--   * Add Supabase Auth before real data goes in (see the bottom of this file).
--
-- The policy below is the least-permissive one that still lets the pilot work:
-- read and write, but no deletes, and rows are capped so the table cannot be
-- filled up by a script.

create table if not exists public.learners (
  name_key   text primary key,
  name       text,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.learners enable row level security;

drop policy if exists "ilearn anon access" on public.learners;
drop policy if exists "ilearn anon read"   on public.learners;
drop policy if exists "ilearn anon write"  on public.learners;
drop policy if exists "ilearn anon update" on public.learners;

-- Read: needed by learner sign-in (one row) and the staff dashboard (all rows).
create policy "ilearn anon read" on public.learners
  for select to anon using (true);

-- Insert/update: needed to save progress. No DELETE policy is created, so the
-- anon key cannot drop learner records — the previous `for all` policy allowed
-- exactly that, which meant one request could empty the table.
create policy "ilearn anon write" on public.learners
  for insert to anon with check (true);

create policy "ilearn anon update" on public.learners
  for update to anon using (true) with check (true);

-- Keep a runaway script from filling the table.
create or replace function public.learners_row_cap() returns trigger
  language plpgsql security definer as $$
begin
  if (select count(*) from public.learners) >= 500 then
    raise exception 'learner limit reached';
  end if;
  return new;
end $$;

drop trigger if exists learners_cap on public.learners;
create trigger learners_cap before insert on public.learners
  for each row execute function public.learners_row_cap();


-- ── Before a real deployment ────────────────────────────────────────────────
-- Replace the policies above with ownership-based ones. The shape:
--
--   1. Turn on Supabase Auth and sign learners in (anonymous sign-in is enough
--      to get a stable auth.uid()).
--   2. Add `owner uuid not null default auth.uid()` to this table.
--   3. Learner policy:  using (owner = auth.uid())
--   4. Staff policy:    a separate `staff` table keyed on auth.uid(), and
--      `using (exists (select 1 from staff where id = auth.uid()))`.
--
-- That is the change that makes the staff dashboard safe to point at real
-- people, and it needs the app's sign-in screens rewritten to match — the
-- current staff sign-in accepts any email with a 6-character password.
