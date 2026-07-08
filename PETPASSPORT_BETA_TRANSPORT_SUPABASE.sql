-- =====================================================
-- 🟢 PetPassport Beta Transport SQL
--
-- Run this in Supabase SQL Editor before testing:
-- share links, QR links, public read-only Passport views,
-- transfer invite previews, and transfer acceptance.
--
-- This migration keeps the existing pets table intact.
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- 🟢 Read-Only Passport Share Links
-- =====================================================

create table if not exists public.passport_shares (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  view text not null default 'buyer',
  enabled boolean not null default true,
  public_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint passport_shares_one_per_pet unique (pet_id)
);

alter table public.passport_shares enable row level security;

drop policy if exists "Owners can read their passport shares" on public.passport_shares;
drop policy if exists "Owners can create passport shares" on public.passport_shares;
drop policy if exists "Owners can update passport shares" on public.passport_shares;
drop policy if exists "Owners can delete passport shares" on public.passport_shares;

create policy "Owners can read their passport shares"
on public.passport_shares
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Owners can create passport shares"
on public.passport_shares
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.pets
    where pets.id = passport_shares.pet_id
      and pets.user_id = auth.uid()
  )
);

create policy "Owners can update passport shares"
on public.passport_shares
for update
to authenticated
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.pets
    where pets.id = passport_shares.pet_id
      and pets.user_id = auth.uid()
  )
)
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.pets
    where pets.id = passport_shares.pet_id
      and pets.user_id = auth.uid()
  )
);

create policy "Owners can delete passport shares"
on public.passport_shares
for delete
to authenticated
using (auth.uid() = owner_id);

-- =====================================================
-- 🟢 Public Share Lookup
--
-- This returns only the stored public snapshot for one
-- exact token. It does not expose the pets table publicly.
-- =====================================================

create or replace function public.get_public_passport_by_token(share_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select
    ps.public_snapshot ||
    jsonb_build_object(
      'share',
      jsonb_build_object(
        'view', ps.view,
        'created_at', ps.created_at
      )
    )
  into result
  from public.passport_shares ps
  where ps.token = share_token
    and ps.enabled = true
    and ps.revoked_at is null
  limit 1;

  return result;
end;
$$;

grant execute on function public.get_public_passport_by_token(text) to anon;
grant execute on function public.get_public_passport_by_token(text) to authenticated;

-- =====================================================
-- 🟢 Passport Transfer Invites
-- =====================================================

create table if not exists public.passport_transfers (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete set null,
  token text not null unique,
  status text not null default 'pending',
  public_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz,
  constraint passport_transfers_status_check
    check (status in ('pending', 'accepted', 'cancelled', 'expired'))
);

alter table public.passport_transfers enable row level security;

drop policy if exists "Owners can read their passport transfers" on public.passport_transfers;
drop policy if exists "Owners can create passport transfers" on public.passport_transfers;
drop policy if exists "Owners can update their passport transfers" on public.passport_transfers;

create policy "Owners can read their passport transfers"
on public.passport_transfers
for select
to authenticated
using (
  auth.uid() = from_user_id
  or auth.uid() = to_user_id
);

create policy "Owners can create passport transfers"
on public.passport_transfers
for insert
to authenticated
with check (
  auth.uid() = from_user_id
  and exists (
    select 1
    from public.pets
    where pets.id = passport_transfers.pet_id
      and pets.user_id = auth.uid()
  )
);

create policy "Owners can update their passport transfers"
on public.passport_transfers
for update
to authenticated
using (
  auth.uid() = from_user_id
  or auth.uid() = to_user_id
)
with check (
  auth.uid() = from_user_id
  or auth.uid() = to_user_id
);

-- =====================================================
-- 🟢 Public Transfer Preview
--
-- Lets a recipient preview a pending transfer without sign-in.
-- They cannot accept ownership until they authenticate.
-- =====================================================

create or replace function public.get_transfer_passport_by_token(transfer_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select
    jsonb_build_object(
      'status', pt.status,
      'expires_at', pt.expires_at,
      'public_snapshot', pt.public_snapshot
    )
  into result
  from public.passport_transfers pt
  where pt.token = transfer_token
    and pt.status = 'pending'
    and (pt.expires_at is null or pt.expires_at > now())
  limit 1;

  return result;
end;
$$;

grant execute on function public.get_transfer_passport_by_token(text) to anon;
grant execute on function public.get_transfer_passport_by_token(text) to authenticated;

-- =====================================================
-- 🟢 Accept Passport Transfer
--
-- Moves ownership of the pet to the signed-in recipient.
-- This is intentionally server-side so users cannot transfer
-- arbitrary pets from the browser.
-- =====================================================

create or replace function public.accept_passport_transfer(transfer_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
  invite public.passport_transfers%rowtype;
  now_ms bigint;
  existing_logs jsonb;
  new_transfer jsonb;
  new_log jsonb;
begin
  recipient := auth.uid();

  if recipient is null then
    raise exception 'You must be signed in to accept a Passport transfer.';
  end if;

  select *
  into invite
  from public.passport_transfers
  where token = transfer_token
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  for update;

  if invite.id is null then
    raise exception 'This transfer invite is invalid, expired, or unavailable.';
  end if;

  if invite.from_user_id = recipient then
    raise exception 'You cannot accept your own transfer invite.';
  end if;

  now_ms := floor(extract(epoch from now()) * 1000)::bigint;

  select coalesce(data->'logs', '[]'::jsonb)
  into existing_logs
  from public.pets
  where id = invite.pet_id;

  new_transfer := jsonb_build_object(
    'enabled', false,
    'token', invite.token,
    'status', 'accepted',
    'createdAt', floor(extract(epoch from invite.created_at) * 1000)::bigint,
    'expiresAt', case
      when invite.expires_at is null then null
      else floor(extract(epoch from invite.expires_at) * 1000)::bigint
    end,
    'cancelledAt', null,
    'acceptedAt', now_ms
  );

  new_log := jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'Passport Transfer Accepted',
    'note', 'Ownership transferred through PetPassport.',
    'time', now_ms
  );

  update public.pets
  set
    user_id = recipient,
    updated_at = now(),
    data = jsonb_set(
      jsonb_set(
        coalesce(data, '{}'::jsonb),
        '{transfer}',
        new_transfer,
        true
      ),
      '{logs}',
      jsonb_build_array(new_log) || existing_logs,
      true
    )
  where id = invite.pet_id;

  update public.passport_transfers
  set
    status = 'accepted',
    to_user_id = recipient,
    accepted_at = now()
  where id = invite.id;

  update public.passport_shares
  set
    enabled = false,
    revoked_at = now(),
    updated_at = now()
  where pet_id = invite.pet_id;

  return jsonb_build_object(
    'ok', true,
    'pet_id', invite.pet_id,
    'status', 'accepted'
  );
end;
$$;

grant execute on function public.accept_passport_transfer(text) to authenticated;

-- =====================================================
-- 🟢 Helpful Indexes
-- =====================================================

create index if not exists passport_shares_token_idx
on public.passport_shares(token);

create index if not exists passport_transfers_token_idx
on public.passport_transfers(token);

create index if not exists passport_transfers_pet_status_idx
on public.passport_transfers(pet_id, status);
