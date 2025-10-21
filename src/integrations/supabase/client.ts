import { createClient } from "@supabase/supabase-js";

// Aceita tanto VITE_SUPABASE_ANON_KEY quanto VITE_SUPABASE_PUBLISHABLE_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL ou SUPABASE_KEY ausentes. Defina em .env: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
