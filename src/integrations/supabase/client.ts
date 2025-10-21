// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

// Aceita VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY (compatibilidade)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY =
  (import.meta.env as any).VITE_SUPABASE_ANON_KEY ||
  (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ SUPABASE_URL ou SUPABASE_KEY ausentes. Defina no .env do Vercel: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
