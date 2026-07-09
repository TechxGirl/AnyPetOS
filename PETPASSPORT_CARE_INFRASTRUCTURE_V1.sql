-- =====================================================
-- 🟢 PetPassport Care Infrastructure v1
-- Enclosures, equipment, smart reminders, files/storage,
-- and permission-based access invites.
--
-- Run this once in Supabase SQL Editor.
-- Safe to rerun. Does not drop or wipe the pets table.
-- =====================================================

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

-- =====================================================
-- 🟢 Enclosures
-- =====================================================

create table if not exists public.enclosures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id bigint references public.pets(id) on delete set null,
  name text not null,
  type text default 'Terrarium',
  size text default '',
  location text default '',
  warm_temp text default '',
  cool_temp text default '',
  humidity text default '',
  substrate text default '',
  cleaning_interval_days integer,
  last_cleaned_at timestamptz,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enclosures enable row level security;

drop policy if exists "enclosures owner select" on public.enclosures;
drop policy if exists "enclosures owner insert" on public.enclosures;
drop policy if exists "enclosures owner update" on public.enclosures;
drop policy if exists "enclosures owner delete" on public.enclosures;

create policy "enclosures owner select" on public.enclosures for select to authenticated using (auth.uid() = user_id);
create policy "enclosures owner insert" on public.enclosures for insert to authenticated with check (auth.uid() = user_id);
create policy "enclosures owner update" on public.enclosures for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "enclosures owner delete" on public.enclosures for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.enclosures to authenticated;

create index if not exists enclosures_user_id_idx on public.enclosures(user_id);
create index if not exists enclosures_pet_id_idx on public.enclosures(pet_id);

-- =====================================================
-- 🟢 Equipment
-- =====================================================

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enclosure_id uuid references public.enclosures(id) on delete set null,
  pet_id bigint references public.pets(id) on delete set null,
  name text not null,
  type text default 'Other',
  brand text default '',
  model text default '',
  purchase_date date,
  installed_at date,
  replace_interval_days integer,
  next_due_at date,
  status text default 'Active',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.equipment enable row level security;

drop policy if exists "equipment owner select" on public.equipment;
drop policy if exists "equipment owner insert" on public.equipment;
drop policy if exists "equipment owner update" on public.equipment;
drop policy if exists "equipment owner delete" on public.equipment;

create policy "equipment owner select" on public.equipment for select to authenticated using (auth.uid() = user_id);
create policy "equipment owner insert" on public.equipment for insert to authenticated with check (auth.uid() = user_id);
create policy "equipment owner update" on public.equipment for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "equipment owner delete" on public.equipment for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.equipment to authenticated;

create index if not exists equipment_user_id_idx on public.equipment(user_id);
create index if not exists equipment_enclosure_id_idx on public.equipment(enclosure_id);
create index if not exists equipment_pet_id_idx on public.equipment(pet_id);

-- =====================================================
-- 🟢 Care Reminders
-- =====================================================

create table if not exists public.care_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id bigint references public.pets(id) on delete cascade,
  enclosure_id uuid references public.enclosures(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  title text not null,
  type text default 'Custom',
  repeat_interval_days integer,
  due_at timestamptz,
  completed_at timestamptz,
  status text default 'upcoming' check (status in ('upcoming', 'completed', 'skipped', 'cancelled')),
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.care_reminders enable row level security;

drop policy if exists "care reminders owner select" on public.care_reminders;
drop policy if exists "care reminders owner insert" on public.care_reminders;
drop policy if exists "care reminders owner update" on public.care_reminders;
drop policy if exists "care reminders owner delete" on public.care_reminders;

create policy "care reminders owner select" on public.care_reminders for select to authenticated using (auth.uid() = user_id);
create policy "care reminders owner insert" on public.care_reminders for insert to authenticated with check (auth.uid() = user_id);
create policy "care reminders owner update" on public.care_reminders for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "care reminders owner delete" on public.care_reminders for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.care_reminders to authenticated;

create index if not exists care_reminders_user_id_idx on public.care_reminders(user_id);
create index if not exists care_reminders_pet_id_idx on public.care_reminders(pet_id);
create index if not exists care_reminders_due_at_idx on public.care_reminders(due_at);
create index if not exists care_reminders_status_idx on public.care_reminders(status);

-- =====================================================
-- 🟢 File Metadata + Supabase Storage Bucket
-- =====================================================

create table if not exists public.pet_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id bigint references public.pets(id) on delete cascade,
  enclosure_id uuid references public.enclosures(id) on delete set null,
  bucket text not null default 'pet-files',
  storage_path text not null,
  file_name text not null,
  file_type text default 'Other',
  mime_type text default '',
  size_bytes bigint default 0,
  is_public_passport boolean not null default false,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pet_files enable row level security;

drop policy if exists "pet files owner select" on public.pet_files;
drop policy if exists "pet files owner insert" on public.pet_files;
drop policy if exists "pet files owner update" on public.pet_files;
drop policy if exists "pet files owner delete" on public.pet_files;

create policy "pet files owner select" on public.pet_files for select to authenticated using (auth.uid() = user_id);
create policy "pet files owner insert" on public.pet_files for insert to authenticated with check (auth.uid() = user_id);
create policy "pet files owner update" on public.pet_files for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pet files owner delete" on public.pet_files for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.pet_files to authenticated;

create index if not exists pet_files_user_id_idx on public.pet_files(user_id);
create index if not exists pet_files_pet_id_idx on public.pet_files(pet_id);
create index if not exists pet_files_storage_path_idx on public.pet_files(storage_path);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-files',
  'pet-files',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/csv']
)
on conflict (id) do nothing;

drop policy if exists "pet files storage owner select" on storage.objects;
drop policy if exists "pet files storage owner insert" on storage.objects;
drop policy if exists "pet files storage owner update" on storage.objects;
drop policy if exists "pet files storage owner delete" on storage.objects;

create policy "pet files storage owner select"
on storage.objects for select to authenticated
using (bucket_id = 'pet-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pet files storage owner insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'pet-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pet files storage owner update"
on storage.objects for update to authenticated
using (bucket_id = 'pet-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'pet-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pet files storage owner delete"
on storage.objects for delete to authenticated
using (bucket_id = 'pet-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- 🟢 Permission-Based Access Invites
-- =====================================================

create table if not exists public.access_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id bigint not null references public.pets(id) on delete cascade,
  recipient_email text default '',
  recipient_user_id uuid references auth.users(id) on delete set null,
  access_level text not null default 'view_only',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  token text not null unique,
  public_snapshot jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.access_permissions enable row level security;

drop policy if exists "access permissions owner select" on public.access_permissions;
drop policy if exists "access permissions recipient select" on public.access_permissions;
drop policy if exists "access permissions owner insert" on public.access_permissions;
drop policy if exists "access permissions owner update" on public.access_permissions;
drop policy if exists "access permissions owner delete" on public.access_permissions;

create policy "access permissions owner select" on public.access_permissions for select to authenticated using (auth.uid() = owner_id);
create policy "access permissions recipient select" on public.access_permissions for select to authenticated using (auth.uid() = recipient_user_id);
create policy "access permissions owner insert" on public.access_permissions for insert to authenticated with check (auth.uid() = owner_id);
create policy "access permissions owner update" on public.access_permissions for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "access permissions owner delete" on public.access_permissions for delete to authenticated using (auth.uid() = owner_id);

grant select, insert, update, delete on public.access_permissions to authenticated;

create index if not exists access_permissions_owner_id_idx on public.access_permissions(owner_id);
create index if not exists access_permissions_pet_id_idx on public.access_permissions(pet_id);
create index if not exists access_permissions_token_idx on public.access_permissions(token);
create index if not exists access_permissions_recipient_user_idx on public.access_permissions(recipient_user_id);

-- =====================================================
-- 🟢 Access Invite Public Preview
-- =====================================================

create or replace function public.get_access_invite_by_token(access_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.access_permissions;
begin
  select *
  into invite_row
  from public.access_permissions
  where token = access_token
    and status in ('pending', 'accepted')
    and (expires_at is null or expires_at > now())
  limit 1;

  if invite_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', invite_row.id,
    'pet_id', invite_row.pet_id,
    'access_level', invite_row.access_level,
    'status', invite_row.status,
    'recipient_email', invite_row.recipient_email,
    'expires_at', invite_row.expires_at,
    'accepted_at', invite_row.accepted_at,
    'public_snapshot', invite_row.public_snapshot
  );
end;
$$;

grant execute on function public.get_access_invite_by_token(text) to anon, authenticated;

-- =====================================================
-- 🟢 Accept Access Invite
-- =====================================================

create or replace function public.accept_access_invite(access_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
  invite_row public.access_permissions;
begin
  recipient := auth.uid();

  if recipient is null then
    raise exception 'You must be signed in to accept an access invite.';
  end if;

  select *
  into invite_row
  from public.access_permissions
  where token = access_token
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  for update;

  if invite_row.id is null then
    raise exception 'This access invite is invalid, expired, or unavailable.';
  end if;

  if invite_row.owner_id = recipient then
    raise exception 'You already own this Passport.';
  end if;

  update public.access_permissions
  set
    recipient_user_id = recipient,
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  where id = invite_row.id;

  return jsonb_build_object(
    'ok', true,
    'status', 'accepted',
    'pet_id', invite_row.pet_id,
    'access_level', invite_row.access_level
  );
end;
$$;

grant execute on function public.accept_access_invite(text) to authenticated;
