import { createClient } from "@supabase/supabase-js";

// KM100 Inventory System: Official Supabase Project
export const SUPABASE_CONFIG = {
  url: "https://kpzancwkmbhnuqbnqrii.supabase.co",
  anonKey: "sb_publishable_Op-yvVaKrb9kArQ2ieDefw_ueZNswLZ",
};

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
);
