-- =====================================================
-- 🟢 PetPassport Database
-- Migration: 002_pets.sql
--
-- Purpose:
-- Create security policies for cloud animal Passports.
--
-- =====================================================

-- ==========================================
-- 🟢 Pets Constraints
-- ==========================================

ALTER TABLE public.pets
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.pets
ALTER COLUMN name SET NOT NULL;

ALTER TABLE public.pets
ALTER COLUMN species SET NOT NULL;

ALTER TABLE public.pets
ALTER COLUMN status SET DEFAULT 'Healthy';

ALTER TABLE public.pets
ALTER COLUMN data SET DEFAULT '{}'::jsonb;

-- ==========================================
-- 🟢 Row Level Security
-- ==========================================

ALTER TABLE public.pets
ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 🟢 Users Can View Their Own Pets
-- ==========================================

CREATE POLICY "Users can view own pets"
ON public.pets
FOR SELECT
USING (auth.uid() = user_id);

-- ==========================================
-- 🟢 Users Can Insert Their Own Pets
-- ==========================================

CREATE POLICY "Users can insert own pets"
ON public.pets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 🟢 Users Can Update Their Own Pets
-- ==========================================

CREATE POLICY "Users can update own pets"
ON public.pets
FOR UPDATE
USING (auth.uid() = user_id);

-- ==========================================
-- 🟢 Users Can Delete Their Own Pets
-- ==========================================

CREATE POLICY "Users can delete own pets"
ON public.pets
FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 🟢 End Migration
-- ==========================================