-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC.
-- Supabase PostgreSQL Database Schema & Security Architecture
-- Version: 2.1.0
-- ==============================================================================

-- 0. User Profiles & Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Facilities / Branches Table
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

-- 2. Facility Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dynamic Column Schema Table (Text, Number, Dropdown)
CREATE TABLE IF NOT EXISTS public.columns_schema (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    order_index INT NOT NULL DEFAULT 0,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory Items & Equipment Register
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    quantity NUMERIC NOT NULL DEFAULT 0,
    units TEXT NOT NULL DEFAULT 'pcs',
    condition TEXT NOT NULL DEFAULT 'Working',
    remarks TEXT DEFAULT '',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_inventory_items_room ON public.inventory_items(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_condition ON public.inventory_items(condition);

-- 5. Row Level Security (RLS) Policies (Institutional Access Only)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current authenticated user is a Property Custodian (admin)
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

-- Profiles: Authenticated users can read their own profile (admins can read all).
-- Anonymous users must use check_admin_registered() instead of reading PII.
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

-- 0.1 Automatic Profile Creation Trigger on Sign-Up (auth.users -> public.profiles)
-- Security: only allow 'admin' role if no admin exists yet; never elevate role on conflict.
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 0.2 Public RPC: returns TRUE if any admin profile exists (callable by anon role)
CREATE OR REPLACE FUNCTION public.check_admin_registered()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin' LIMIT 1);
$$;

GRANT EXECUTE ON FUNCTION public.check_admin_registered() TO anon, authenticated;

-- Facilities: Authenticated read; admin-only write
DROP POLICY IF EXISTS "Allow authenticated read facilities" ON public.facilities;
CREATE POLICY "Allow authenticated read facilities" ON public.facilities
    FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow admin write facilities" ON public.facilities;
CREATE POLICY "Allow admin write facilities" ON public.facilities
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Rooms: Authenticated read; admin-only write
DROP POLICY IF EXISTS "Allow authenticated read rooms" ON public.rooms;
CREATE POLICY "Allow authenticated read rooms" ON public.rooms
    FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow admin write rooms" ON public.rooms;
CREATE POLICY "Allow admin write rooms" ON public.rooms
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Schema Columns: Authenticated read; admin-only write
DROP POLICY IF EXISTS "Allow authenticated read columns" ON public.columns_schema;
CREATE POLICY "Allow authenticated read columns" ON public.columns_schema
    FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write columns" ON public.columns_schema;
DROP POLICY IF EXISTS "Allow admin write columns" ON public.columns_schema;
CREATE POLICY "Allow admin write columns" ON public.columns_schema
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inventory Items: Authenticated personnel can read, add, and update items
DROP POLICY IF EXISTS "Allow authenticated read items" ON public.inventory_items;
CREATE POLICY "Allow authenticated read items" ON public.inventory_items
    FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write items" ON public.inventory_items;
CREATE POLICY "Allow authenticated write items" ON public.inventory_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Real-Time Subscription Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.facilities, public.rooms, public.columns_schema, public.inventory_items;
