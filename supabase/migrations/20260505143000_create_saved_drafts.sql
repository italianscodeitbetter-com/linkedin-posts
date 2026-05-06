create table if not exists public.saved_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  style text not null,
  generated_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_drafts_user_created_idx
  on public.saved_drafts (user_id, created_at desc);

alter table public.saved_drafts enable row level security;

drop policy if exists "saved_drafts_select_own" on public.saved_drafts;
create policy "saved_drafts_select_own"
  on public.saved_drafts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_drafts_insert_own" on public.saved_drafts;
create policy "saved_drafts_insert_own"
  on public.saved_drafts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "saved_drafts_delete_own" on public.saved_drafts;
create policy "saved_drafts_delete_own"
  on public.saved_drafts
  for delete
  to authenticated
  using (auth.uid() = user_id);
