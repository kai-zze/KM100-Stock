# KM100 Inventory Backend & Supabase Database Guide

## 1. Cloud Database Connection
- **Project Name**: `KM100-Stock`
- **Project URL**: `https://kpzancwkmbhnuqbnqrii.supabase.co`
- **Publishable Key**: `sb_publishable_Op-yvVaKrb9kArQ2ieDefw_ueZNswLZ`
- **Database Engine**: PostgreSQL 15+ with Realtime WebSockets

## 2. Directory Structure
```
backend/
└── database/
    ├── schema.sql       # Full PostgreSQL table definitions, RLS policies, and indexes
    └── seed.sql         # Optional sample/initial institutional data
```

## 3. How to Deploy / Recreate Tables
1. Open your Supabase Dashboard at `https://supabase.com`.
2. Go to **SQL Editor** (`>_`).
3. Paste the contents of `backend/database/schema.sql` and click **Run**.
