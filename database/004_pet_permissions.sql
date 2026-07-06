-- =====================================================
-- 🟢 PetPassport Database
-- Migration: 004_pet_permissions.sql
--
-- Purpose:
-- Allow authenticated users to access their own pets
-- through RLS policies.
--
-- =====================================================

GRANT SELECT ON public.pets TO authenticated;
GRANT INSERT ON public.pets TO authenticated;
GRANT UPDATE ON public.pets TO authenticated;
GRANT DELETE ON public.pets TO authenticated;