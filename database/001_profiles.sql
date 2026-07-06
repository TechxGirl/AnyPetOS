-- =====================================================
-- 🟢 PetPassport Database
-- Migration: 001_profiles.sql
--
-- Purpose:
-- Create the user profile structure and security policies.
--
-- =====================================================

-- ==========================================
-- 🟢 Profiles Constraints
-- ==========================================

ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

ALTER TABLE public.profiles
ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE public.profiles
ALTER COLUMN role SET NOT NULL;

-- ==========================================
-- 🟢 Username Must Be Unique
-- ==========================================

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique
UNIQUE (username);

-- ==========================================
-- 🟢 Row Level Security
-- ==========================================

ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 🟢 Users Can View Their Own Profile
-- ==========================================

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- ==========================================
-- 🟢 Users Can Insert Their Own Profile
-- ==========================================

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ==========================================
-- 🟢 Users Can Update Their Own Profile
-- ==========================================

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- ==========================================
-- 🟢 End Migration
-- ==========================================