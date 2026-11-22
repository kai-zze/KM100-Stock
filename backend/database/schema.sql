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

-- 1. Facility Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dynamic Column Schema Table (Text, Number, Dropdown)
CREATE TABLE IF NOT EXISTS public.columns_schema (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    order_index INT NOT NULL DEFAULT 0,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Items & Equipment Register
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

-- 4. Row Level Security (RLS) Policies (Institutional Access Only)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read directory; users can update own profile
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms: Authenticated training center personnel can read; write restricted to authenticated staff/admin
CREATE POLICY "Allow authenticated read rooms" ON public.rooms
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write rooms" ON public.rooms
    FOR ALL TO authenticated USING (true);

-- Schema Columns: Authenticated personnel can read; write restricted to authenticated staff/admin
CREATE POLICY "Allow authenticated read columns" ON public.columns_schema
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write columns" ON public.columns_schema
    FOR ALL TO authenticated USING (true);

-- Inventory Items: Authenticated personnel can read and update items
CREATE POLICY "Allow authenticated read items" ON public.inventory_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write items" ON public.inventory_items
    FOR ALL TO authenticated USING (true);

-- 5. Real-Time Subscription Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.rooms, public.columns_schema, public.inventory_items;
