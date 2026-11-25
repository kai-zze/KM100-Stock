-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC.
-- Migration 002: Add check_admin_registered() RPC
--
-- PURPOSE:
--   After logout the Supabase client has no session, so the profiles table
--   (SELECT TO authenticated) returns 0 rows — making the system incorrectly
--   think no admin exists and re-opening the admin registration slot.
--
--   This SECURITY DEFINER function bypasses RLS and can be called by the
--   anonymous role (unauthenticated users) safely. It only returns a boolean.
--
-- HOW TO APPLY:
--   1. Open your Supabase project → SQL Editor
--   2. Paste and run this entire file
-- ==============================================================================

-- 1. Function: returns TRUE if at least one admin profile exists
CREATE OR REPLACE FUNCTION public.check_admin_registered()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'admin' LIMIT 1
  );
$$;

-- 2. Grant execute to anon (unauthenticated) and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_admin_registered() TO anon, authenticated;

-- 3. Restrict direct profiles reads to authenticated owner or admin;
--    anonymous registration checks use check_admin_registered() RPC instead.
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read own or admin profiles" ON public.profiles
    FOR SELECT TO authenticated USING (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
