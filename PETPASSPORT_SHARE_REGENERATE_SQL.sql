-- =====================================================
-- 🟢 PetPassport Share Link Regenerate Fix
--
-- Run this once in Supabase SQL Editor.
--
-- Why:
-- The first beta SQL allowed only one share row per pet.
-- For better beta behavior, regenerating a link should keep old links dead
-- and insert a fresh new token.
-- =====================================================

alter table public.passport_shares
drop constraint if exists passport_shares_one_per_pet;

create index if not exists passport_shares_pet_owner_idx
on public.passport_shares (pet_id, owner_id);

create index if not exists passport_shares_enabled_idx
on public.passport_shares (enabled);
