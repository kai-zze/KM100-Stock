-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC.
-- Supabase PostgreSQL Database Schema
-- Version: 2.0.0
-- ==============================================================================

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

-- 4. Row Level Security (RLS) Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.rooms FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.columns_schema FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.columns_schema FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.inventory_items FOR ALL USING (true);

-- 5. Real-Time Subscription Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms, public.columns_schema, public.inventory_items;
