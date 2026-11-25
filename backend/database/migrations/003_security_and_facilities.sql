-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC.
-- Migration 003: Security Hardening (RLS & Privilege Escalation) + Facilities Table
-- ==============================================================================

-- 1. Facilities Table for Multi-Device Sync
CREATE TABLE IF NOT EXISTS public.facilities (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    badge_class TEXT DEFAULT '',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- 2. Admin helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Harden handle_new_user trigger against metadata role spoofing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT := COALESCE(new.raw_user_meta_data->>'role', 'staff');
    assigned_role TEXT := 'staff';
BEGIN
    IF requested_role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        assigned_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        assigned_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Harden Profiles RLS
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read own or admin profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read own or admin profiles" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Allow users insert own profile" ON public.profiles;
CREATE POLICY "Allow users insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = id
        AND (
            role = 'staff'
            OR (role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin'))
        )
    );

DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
CREATE POLICY "Allow users update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

-- 5. Facilities, Rooms, and Columns Schema RBAC (Admin-only writes)
DROP POLICY IF EXISTS "Allow authenticated read facilities" ON public.facilities;
CREATE POLICY "Allow authenticated read facilities" ON public.facilities
    FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow admin write facilities" ON public.facilities;
CREATE POLICY "Allow admin write facilities" ON public.facilities
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated write rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow admin write rooms" ON public.rooms;
CREATE POLICY "Allow admin write rooms" ON public.rooms
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated write columns" ON public.columns_schema;
DROP POLICY IF EXISTS "Allow admin write columns" ON public.columns_schema;
CREATE POLICY "Allow admin write columns" ON public.columns_schema
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Enable Realtime on facilities
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
