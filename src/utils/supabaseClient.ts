import { createClient } from "@supabase/supabase-js";

// KM100 Inventory System: Official Supabase Project
const env = (
  import.meta as unknown as { env?: Record<string, string | undefined> }
)?.env;

export const SUPABASE_CONFIG = {
  url: env?.VITE_SUPABASE_URL || "https://kpzancwkmbhnuqbnqrii.supabase.co",
  anonKey:
    env?.VITE_SUPABASE_ANON_KEY ||
    "sb_publishable_Op-yvVaKrb9kArQ2ieDefw_ueZNswLZ",
};

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
);
