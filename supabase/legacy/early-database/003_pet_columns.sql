-- =====================================================
-- 🟢 PetPassport Database
-- Migration: 003_pet_columns.sql
--
-- Purpose:
-- Add important queryable columns to cloud Passports.
--
-- =====================================================

-- ==========================================
-- 🟢 Add Pet Columns
-- ==========================================

ALTER TABLE public.pets
ADD COLUMN IF NOT EXISTS favorite boolean DEFAULT false;

ALTER TABLE public.pets
ADD COLUMN IF NOT EXISTS last_fed timestamptz;

ALTER TABLE public.pets
ADD COLUMN IF NOT EXISTS next_feed timestamptz;

ALTER TABLE public.pets
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ==========================================
-- 🟢 Helpful Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS pets_user_id_idx
ON public.pets (user_id);

CREATE INDEX IF NOT EXISTS pets_user_status_idx
ON public.pets (user_id, status);

CREATE INDEX IF NOT EXISTS pets_user_next_feed_idx
ON public.pets (user_id, next_feed);

CREATE INDEX IF NOT EXISTS pets_user_favorite_idx
ON public.pets (user_id, favorite);

-- ==========================================
-- 🟢 End Migration
-- ==========================================